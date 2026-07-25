package com.pecdevelopers.events.service;

import com.pecdevelopers.events.config.SupabaseProperties;
import com.pecdevelopers.events.model.dto.*;
import com.pecdevelopers.events.model.entity.EligibleEnrollment;
import com.pecdevelopers.events.model.entity.Role;
import com.pecdevelopers.events.model.entity.User;
import com.pecdevelopers.events.repository.EligibleEnrollmentRepository;
import com.pecdevelopers.events.repository.RoleRepository;
import com.pecdevelopers.events.repository.UserRepository;
import com.pecdevelopers.events.service.port.AuthServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService implements AuthServicePort {

    private final SupabaseProperties supabaseProperties;
    private final EligibleEnrollmentRepository eligibleEnrollmentRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final WebClient webClient = WebClient.create();

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Validate against eligible enrollments
        eligibleEnrollmentRepository
            .findByRegistrationNumberIgnoreCase(request.registrationNumber())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration number is not enrolled."));

        // Check duplicate registration number
        if (userRepository.findByRegistrationNumberIgnoreCase(request.registrationNumber()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Registration number already exists. Redirecting to login.");
        }

        // Call Supabase SignUp API
        Map<?, ?> response;
        try {
            response = webClient.post()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/signup")
                    .header("apikey", supabaseProperties.getAnonKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "email", request.email(),
                            "password", request.password(),
                            "phone", request.phoneNumber() != null ? request.phoneNumber() : "",
                            "data", Map.of(
                                    "name", request.name(),
                                    "registrationNumber", request.registrationNumber()
                            )
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Registration failed: " + e.getMessage(), e);
        }

        if (response == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid response from Auth Provider.");
        }

        // Extract User ID
        UUID userId;
        String accessToken = null;
        if (response.containsKey("user")) {
            Map<?, ?> userMap = (Map<?, ?>) response.get("user");
            userId = UUID.fromString((String) userMap.get("id"));
        } else if (response.containsKey("id")) {
            userId = UUID.fromString((String) response.get("id"));
        } else {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "User ID missing from Auth response.");
        }

        if (response.containsKey("access_token")) {
            accessToken = (String) response.get("access_token");
        }

        // Sync local user profile
        User user = syncUserProfile(userId, request.email(), request.name(), request.registrationNumber(), request.phoneNumber());

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment(),
                user.getRegistrationNumber(),
                accessToken
        );
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String resolvedEmail = request.email();
        if (!resolvedEmail.contains("@")) {
            // Treat as registration number
            resolvedEmail = userRepository.findByRegistrationNumberIgnoreCase(resolvedEmail)
                    .map(User::getEmail)
                    .orElseGet(() -> eligibleEnrollmentRepository.findByRegistrationNumberIgnoreCase(request.email())
                            .map(EligibleEnrollment::getEmail)
                            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid registration number.")));
        }

        // Call Supabase Token API
        Map<?, ?> response;
        try {
            response = webClient.post()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/token?grant_type=password")
                    .header("apikey", supabaseProperties.getAnonKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "email", resolvedEmail,
                            "password", request.password()
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials.", e);
        }

        if (response == null || !response.containsKey("access_token")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication failed.");
        }

        String accessToken = (String) response.get("access_token");
        Map<?, ?> userMap = (Map<?, ?>) response.get("user");
        UUID userId = UUID.fromString((String) userMap.get("id"));

        // Extract metadata for sync
        Map<?, ?> userMetadata = (Map<?, ?>) userMap.get("user_metadata");
        String name = userMetadata != null && userMetadata.containsKey("name") ? (String) userMetadata.get("name") : "User";
        String regNum = userMetadata != null && userMetadata.containsKey("registrationNumber") ? (String) userMetadata.get("registrationNumber") : null;
        String phone = (String) userMap.get("phone");

        // Sync local user profile
        User user = syncUserProfile(userId, resolvedEmail, name, regNum, phone);

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment(),
                user.getRegistrationNumber(),
                accessToken
        );
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        String identity = request.identity();
        try {
            if ("EMAIL".equalsIgnoreCase(request.channel())) {
                webClient.post()
                        .uri(supabaseProperties.getUrl() + "/auth/v1/recover")
                        .header("apikey", supabaseProperties.getAnonKey())
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(Map.of("email", identity))
                        .retrieve()
                        .toBodilessEntity()
                        .block();
            } else {
                // SMS Recovery via OTP
                webClient.post()
                        .uri(supabaseProperties.getUrl() + "/auth/v1/otp")
                        .header("apikey", supabaseProperties.getAnonKey())
                        .contentType(MediaType.APPLICATION_JSON)
                        .bodyValue(Map.of(
                                "phone", identity,
                                "create_user", false
                        ))
                        .retrieve()
                        .toBodilessEntity()
                        .block();
            }
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to dispatch reset verification: " + e.getMessage(), e);
        }
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        String identity = request.sessionToken(); // In V1 we use the identity as the sessionToken
        String verifyType = identity.startsWith("+") ? "sms" : "recovery";

        Map<?, ?> verifyResponse;
        try {
            verifyResponse = webClient.post()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/verify")
                    .header("apikey", supabaseProperties.getAnonKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            verifyType.equals("sms") ? "phone" : "email", identity,
                            "token", request.otp(),
                            "type", verifyType
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or expired OTP code.", e);
        }

        if (verifyResponse == null || !verifyResponse.containsKey("access_token")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "OTP verification failed.");
        }

        String tempAccessToken = (String) verifyResponse.get("access_token");

        // Update password using the verified access token
        try {
            webClient.put()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/user")
                    .header("apikey", supabaseProperties.getAnonKey())
                    .header("Authorization", "Bearer " + tempAccessToken)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of("password", request.newPassword()))
                    .retrieve()
                    .toBodilessEntity()
                    .block();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to update password: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getActiveUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User profile not found."));
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment(),
                user.getRegistrationNumber()
        );
    }

    @Transactional
    public User syncUserProfile(UUID userId, String email, String name, String registrationNumber, String phoneNumber) {
        Optional<User> existingUser = userRepository.findById(userId);
        if (existingUser.isPresent()) {
            return existingUser.get();
        }

        // Try mapping role & department from pre-seeded enrollments
        String dept = null;
        String roleName = "STUDENT"; // Fallback role

        if (registrationNumber != null) {
            Optional<EligibleEnrollment> enrollmentOpt = eligibleEnrollmentRepository
                    .findByRegistrationNumberIgnoreCase(registrationNumber);
            if (enrollmentOpt.isPresent()) {
                EligibleEnrollment env = enrollmentOpt.get();
                dept = env.getDepartment();
                if (env.getRole() != null) {
                    roleName = env.getRole();
                }
            }
        }

        final String finalRoleName = roleName;
        Role role = roleRepository.findByNameIgnoreCase(finalRoleName)
                .orElseGet(() -> roleRepository.save(Role.builder().name(finalRoleName.toUpperCase()).build()));

        User user = User.builder()
                .id(userId)
                .name(name)
                .email(email.toLowerCase())
                .phoneNumber(phoneNumber)
                .registrationNumber(registrationNumber)
                .department(dept)
                .role(role.getName())
                .roleEntity(role)
                .build();

        return userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponse updateProfile(UUID userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User profile not found."));

        user.setName(request.name());
        user.setEmail(request.email().toLowerCase());
        user.setPhoneNumber(request.phoneNumber());
        user.setProfileImageUrl(request.profileImageUrl());

        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<UserResponse> listUsersByRole(String role) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() != null && u.getRole().equalsIgnoreCase(role))
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<UserResponse> listCoordinatorsByDepartment(String department) {
        return userRepository.findAll().stream()
                .filter(u -> u.getDepartment() != null && u.getDepartment().equalsIgnoreCase(department))
                .filter(u -> u.getRole() != null && (u.getRole().equalsIgnoreCase("STUDENT_COORDINATOR") || u.getRole().equalsIgnoreCase("FACULTY_COORDINATOR")))
                .map(this::mapToUserResponse)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse createSpoc(RegisterRequest request, String department) {
        UUID userId = signupInSupabase(request);
        Role role = roleRepository.findByNameIgnoreCase("SPOC")
                .orElseGet(() -> roleRepository.save(Role.builder().name("SPOC").build()));

        User user = User.builder()
                .id(userId)
                .name(request.name())
                .email(request.email().toLowerCase())
                .phoneNumber(request.phoneNumber())
                .registrationNumber(request.registrationNumber())
                .department(department)
                .role(role.getName())
                .roleEntity(role)
                .build();

        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    @Override
    @Transactional
    public UserResponse createCoordinator(RegisterRequest request, String role, String department) {
        UUID userId = signupInSupabase(request);
        Role roleEntity = roleRepository.findByNameIgnoreCase(role)
                .orElseGet(() -> roleRepository.save(Role.builder().name(role.toUpperCase()).build()));

        User user = User.builder()
                .id(userId)
                .name(request.name())
                .email(request.email().toLowerCase())
                .phoneNumber(request.phoneNumber())
                .registrationNumber(request.registrationNumber())
                .department(department)
                .role(roleEntity.getName())
                .roleEntity(roleEntity)
                .build();

        User saved = userRepository.save(user);
        return mapToUserResponse(saved);
    }

    @Override
    @Transactional
    public void deleteUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User profile not found."));

        userRepository.delete(user);

        try {
            if (supabaseProperties.getServiceRoleKey() != null && !supabaseProperties.getServiceRoleKey().isEmpty()) {
                webClient.delete()
                        .uri(supabaseProperties.getUrl() + "/auth/v1/admin/users/" + userId)
                        .header("apikey", supabaseProperties.getServiceRoleKey())
                        .header("Authorization", "Bearer " + supabaseProperties.getServiceRoleKey())
                        .retrieve()
                        .toBodilessEntity()
                        .block();
            }
        } catch (Exception e) {
            System.err.println("Warning: failed to delete user from Supabase auth: " + e.getMessage());
        }
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getDepartment(),
                user.getRegistrationNumber()
        );
    }

    private UUID signupInSupabase(RegisterRequest request) {
        Map<?, ?> response;
        try {
            response = webClient.post()
                    .uri(supabaseProperties.getUrl() + "/auth/v1/signup")
                    .header("apikey", supabaseProperties.getAnonKey())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(Map.of(
                            "email", request.email(),
                            "password", request.password(),
                            "phone", request.phoneNumber() != null ? request.phoneNumber() : "",
                            "data", Map.of(
                                    "name", request.name(),
                                    "registrationNumber", request.registrationNumber()
                            )
                    ))
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Auth provider signup failed: " + e.getMessage(), e);
        }

        if (response == null) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid response from Auth Provider.");
        }

        if (response.containsKey("user")) {
            Map<?, ?> userMap = (Map<?, ?>) response.get("user");
            return UUID.fromString((String) userMap.get("id"));
        } else if (response.containsKey("id")) {
            return UUID.fromString((String) response.get("id"));
        } else {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "User ID missing from Auth response.");
        }
    }
}
