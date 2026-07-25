package com.pecdevelopers.events.repository;

import com.pecdevelopers.events.model.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, String> {
}
