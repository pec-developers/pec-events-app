package com.pecdevelopers.events.service;

import com.pecdevelopers.events.model.entity.EligibleEnrollment;
import com.pecdevelopers.events.repository.EligibleEnrollmentRepository;
import com.pecdevelopers.events.service.port.EligibleEnrollmentServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EligibleEnrollmentService implements EligibleEnrollmentServicePort {

    private final EligibleEnrollmentRepository eligibleEnrollmentRepository;

    @Override
    @Transactional
    public void seedEligibleEnrollments(List<EligibleEnrollment> enrollments, String spocDepartment) {
        for (EligibleEnrollment enrollment : enrollments) {
            // Verify department matches SPOC's department boundaries
            if (enrollment.getDepartment() == null || !enrollment.getDepartment().equalsIgnoreCase(spocDepartment)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                    "Cannot seed profile belonging to a different department: " + enrollment.getDepartment());
            }

            // Capitalize role for safety
            if (enrollment.getRole() != null) {
                enrollment.setRole(enrollment.getRole().toUpperCase());
            } else {
                enrollment.setRole("STUDENT"); // Default fallback
            }

            eligibleEnrollmentRepository.save(enrollment);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EligibleEnrollment> getSeededEnrollmentsByDepartment(String department) {
        return eligibleEnrollmentRepository.findByDepartmentIgnoreCase(department);
    }
}
