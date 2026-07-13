package com.pecdevelopers.events.model.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record EventResponse(
    UUID id,
    String title,
    String description,
    Integer capacity,
    Boolean active,
    String date,
    UUID creatorId,
    Long registrationsCount,
    BigDecimal price,
    String departmentScope,
    String department,
    String status,
    String bannerImageUrl,
    String posterImageUrl,
    List<String> eventPhotosUrls
) {}
