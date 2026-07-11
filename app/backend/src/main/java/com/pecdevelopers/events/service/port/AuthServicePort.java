package com.pecdevelopers.events.service.port;

import com.pecdevelopers.events.model.dto.*;
import java.util.UUID;

public interface AuthServicePort {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void resetPassword(ResetPasswordRequest request);
    UserResponse getActiveUser(UUID userId);
}
