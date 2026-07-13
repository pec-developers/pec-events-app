package com.pecdevelopers.events.service.port;

import com.pecdevelopers.events.model.entity.EligibleEnrollment;
import java.util.List;

public interface EligibleEnrollmentServicePort {
    void seedEligibleEnrollments(List<EligibleEnrollment> enrollments, String spocDepartment);
    List<EligibleEnrollment> getSeededEnrollmentsByDepartment(String department);
}
