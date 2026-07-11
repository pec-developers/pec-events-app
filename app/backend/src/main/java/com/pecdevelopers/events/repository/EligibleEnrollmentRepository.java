package com.pecdevelopers.events.repository;

import com.pecdevelopers.events.model.entity.EligibleEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EligibleEnrollmentRepository extends JpaRepository<EligibleEnrollment, String> {
    Optional<EligibleEnrollment> findByEmailIgnoreCase(String email);
    Optional<EligibleEnrollment> findByRegistrationNumberIgnoreCase(String registrationNumber);
}
