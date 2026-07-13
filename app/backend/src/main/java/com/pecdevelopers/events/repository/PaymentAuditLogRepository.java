package com.pecdevelopers.events.repository;

import com.pecdevelopers.events.model.entity.PaymentAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface PaymentAuditLogRepository extends JpaRepository<PaymentAuditLog, UUID> {
    Optional<PaymentAuditLog> findByRegistrationId(UUID registrationId);
}
