package com.pecdevelopers.events.service;

import com.pecdevelopers.events.model.entity.Department;
import com.pecdevelopers.events.repository.DepartmentRepository;
import com.pecdevelopers.events.service.port.DepartmentServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService implements DepartmentServicePort {

    private final DepartmentRepository repository;

    @Override
    public List<Department> getAllDepartments() {
        return repository.findAll();
    }

    @Override
    public Department getDepartment(String code) {
        return repository.findById(code)
                .orElseThrow(() -> new IllegalArgumentException("Department with code " + code + " not found."));
    }

    @Override
    @Transactional
    public Department createDepartment(Department department) {
        if (repository.existsById(department.getCode())) {
            throw new IllegalArgumentException("Department with code " + department.getCode() + " already exists.");
        }
        department.setCreatedAt(LocalDateTime.now());
        return repository.save(department);
    }

    @Override
    @Transactional
    public Department updateDepartment(String code, Department department) {
        Department existing = getDepartment(code);
        existing.setName(department.getName());
        return repository.save(existing);
    }

    @Override
    @Transactional
    public void deleteDepartment(String code) {
        if (!repository.existsById(code)) {
            throw new IllegalArgumentException("Department with code " + code + " not found.");
        }
        repository.deleteById(code);
    }
}
