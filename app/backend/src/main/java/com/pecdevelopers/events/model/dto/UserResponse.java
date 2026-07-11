package com.pecdevelopers.events.model.dto;

import java.util.UUID;

public record UserResponse(
    UUID userId,
    String name,
    String email,
    String role,
    String department,
    String registrationNumber
) {}
