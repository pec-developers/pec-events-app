package com.pecdevelopers.events.model.dto;

import java.util.UUID;

public record RegistrationDetailResponse(
    UUID id,
    UUID eventId,
    UUID studentId,
    String status,
    String createdAt,
    String studentName,
    String studentEmail,
    String studentRegNum,
    String studentDept
) {}
