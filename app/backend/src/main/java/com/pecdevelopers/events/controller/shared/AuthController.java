package com.pecdevelopers.events.controller.shared;

import com.pecdevelopers.events.model.dto.*;
import com.pecdevelopers.events.service.port.AuthServicePort;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthServicePort authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        AuthResponse response = authService.register(request);
        if (response.accessToken() != null) {
            setAuthCookie(httpRequest, httpResponse, response.accessToken());
        }
        return response;
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse
    ) {
        AuthResponse response = authService.login(request);
        if (response.accessToken() != null) {
            setAuthCookie(httpRequest, httpResponse, response.accessToken());
        }
        return response;
    }

    @PostMapping("/logout")
    public MessageResponse logout(HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        boolean isSecure = httpRequest.isSecure() || "https".equalsIgnoreCase(httpRequest.getHeader("X-Forwarded-Proto"));
        ResponseCookie cookie = ResponseCookie.from("authToken", "")
                .httpOnly(true)
                .secure(isSecure)
                .sameSite(isSecure ? "None" : "Lax")
                .path("/")
                .maxAge(0)
                .build();
        httpResponse.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        return new MessageResponse("Logged out successfully");
    }

    @PostMapping("/password/forgot")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        // In V1 we use the identity as the sessionToken
        return new MessageResponse("Reset OTP dispatched via selected channel.");
    }

    @PostMapping("/password/reset")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return new MessageResponse("Password successfully updated.");
    }

    @GetMapping("/me")
    public UserResponse getActiveUser(HttpServletRequest request) {
        String userIdAttr = (String) request.getAttribute("userId");
        if (userIdAttr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }
        try {
            UUID userId = UUID.fromString(userIdAttr);
            return authService.getActiveUser(userId);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid user identifier");
        }
    }

    private void setAuthCookie(HttpServletRequest request, HttpServletResponse response, String token) {
        boolean isSecure = request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        ResponseCookie cookie = ResponseCookie.from("authToken", token)
                .httpOnly(true)
                .secure(isSecure)
                .sameSite(isSecure ? "None" : "Lax")
                .path("/")
                .maxAge(30 * 24 * 60 * 60) // 30 days
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
