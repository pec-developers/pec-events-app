package com.pecdevelopers.events.repository;

import com.pecdevelopers.events.model.entity.EligibleEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EligibleEnrollmentRepository extends JpaRepository<EligibleEnrollment, String> {
    Optional<EligibleEnrollment> findByEmailIgnoreCase(String email);
    Optional<EligibleEnrollment> findByRegistrationNumberIgnoreCase(String registrationNumber);
    java.util.List<EligibleEnrollment> findByDepartmentIgnoreCase(String department);
}
