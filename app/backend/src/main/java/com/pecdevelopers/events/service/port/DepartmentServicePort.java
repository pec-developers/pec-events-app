package com.pecdevelopers.events.service.port;

import com.pecdevelopers.events.model.entity.Department;
import java.util.List;

public interface DepartmentServicePort {
    List<Department> getAllDepartments();
    Department getDepartment(String code);
    Department createDepartment(Department department);
    Department updateDepartment(String code, Department department);
    void deleteDepartment(String code);
}
