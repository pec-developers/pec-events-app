package com.pecdevelopers.events.service.port;

import com.pecdevelopers.events.model.dto.*;
import java.util.UUID;

public interface AuthServicePort {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    UserResponse getActiveUser(UUID userId);
    UserResponse updateProfile(UUID userId, ProfileUpdateRequest request);
    java.util.List<UserResponse> listUsersByRole(String role);
    java.util.List<UserResponse> listCoordinatorsByDepartment(String department);
    UserResponse createSpoc(RegisterRequest request, String department);
    UserResponse createCoordinator(RegisterRequest request, String role, String department);
    void deleteUser(UUID userId);
}
