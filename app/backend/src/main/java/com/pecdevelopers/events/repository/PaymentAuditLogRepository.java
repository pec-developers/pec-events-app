package com.pecdevelopers.events.repository;

import com.pecdevelopers.events.model.entity.PaymentAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentAuditLogRepository extends JpaRepository<PaymentAuditLog, UUID> {
    Optional<PaymentAuditLog> findByRegistrationId(UUID registrationId);
}
