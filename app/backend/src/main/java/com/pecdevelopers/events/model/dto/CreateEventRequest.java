package com.pecdevelopers.events.model.dto;

import java.math.BigDecimal;
import java.util.List;

public record CreateEventRequest(
    String title,
    String description,
    Integer capacity,
    String date,
    BigDecimal price,
    String departmentScope,
    String bannerImageUrl,
    String posterImageUrl,
    List<String> eventPhotosUrls,
    Boolean isDraft
) {}
