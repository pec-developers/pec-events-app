package com.pecdevelopers.events.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    private User creator;

    @Column(length = 50)
    private String department;

    @Column(precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal price = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer capacity;

    @Column(name = "qr_code_url")
    private String qrCodeUrl;

    @Column(name = "banner_image_url")
    private String bannerImageUrl;

    @Column(name = "poster_image_url")
    private String posterImageUrl;

    @ElementCollection
    @CollectionTable(name = "event_photos", joinColumns = @JoinColumn(name = "event_id"))
    @Column(name = "photo_url")
    private List<String> eventPhotosUrls;

    @Builder.Default
    private Boolean active = true;

    private LocalDateTime date;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
