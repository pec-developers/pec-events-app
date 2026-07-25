package com.pecdevelopers.events.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
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

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "event_photos_urls")
    private List<String> eventPhotosUrls;

    @Column(length = 20)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "department_scope", length = 20)
    @Builder.Default
    private String departmentScope = "ALL_DEPTS";

    @Builder.Default
    private Boolean active = true;

    private LocalDateTime date;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
