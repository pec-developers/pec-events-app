package com.pecdevelopers.events.model.dto;

import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
    @NotBlank(message = "Identity is required")
    String identity,

    @NotBlank(message = "Channel is required")
    String channel // EMAIL or SMS
) {}
