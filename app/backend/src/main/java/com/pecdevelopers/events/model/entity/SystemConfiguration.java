package com.pecdevelopers.events.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_configurations")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemConfiguration {
    @Id
    @Column(name = "`key`", length = 50)
    private String key;

    @Column(name = "`value`", nullable = false)
    private Integer value;

    @Column(columnDefinition = "text")
    private String description;

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
