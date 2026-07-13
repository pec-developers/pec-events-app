package com.pecdevelopers.events.model.dto;

import java.util.UUID;

public record RegistrationResponse(
    UUID id,
    UUID eventId,
    UUID studentId,
    String status,
    String createdAt,
    String eventTitle
) {}
