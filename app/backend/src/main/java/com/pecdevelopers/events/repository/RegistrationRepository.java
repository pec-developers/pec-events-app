package com.pecdevelopers.events.repository;

import com.pecdevelopers.events.model.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RegistrationRepository extends JpaRepository<Registration, UUID> {
    long countByEventIdAndStatusIn(UUID eventId, List<String> statuses);
    Optional<Registration> findFirstByEventIdAndStatusOrderByCreatedAtAsc(UUID eventId, String status);
}
