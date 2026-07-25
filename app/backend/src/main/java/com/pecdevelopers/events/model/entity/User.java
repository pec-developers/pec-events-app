package com.pecdevelopers.events.model.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    private UUID id; // Matches Supabase auth.users.id

    @Column(nullable = false, length = 100)
    private String name;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "registration_number", length = 50)
    private String registrationNumber;

    @Column(length = 50)
    private String department;

    @Column(length = 50)
    private String role; // Matches role name

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id")
    private Role roleEntity;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    @PreUpdate
    private void syncRoleFromEntity() {
        if (this.roleEntity != null) {
            this.role = this.roleEntity.getName();
        }
    }
}
