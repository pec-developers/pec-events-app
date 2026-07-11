package com.pecdevelopers.events.model.dto;

import jakarta.validation.constraints.NotBlank;

public record ResetPasswordRequest(
    @NotBlank(message = "Session token is required")
    String sessionToken,

    @NotBlank(message = "OTP is required")
    String otp,

    @NotBlank(message = "New password is required")
    String newPassword
) {}
