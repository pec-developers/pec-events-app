package com.pecdevelopers.events.controller.admin;

import com.pecdevelopers.events.annotation.RequiresRole;
import com.pecdevelopers.events.model.entity.Department;
import com.pecdevelopers.events.service.port.DepartmentServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/departments")
@RequiresRole({"ADMIN"})
@RequiredArgsConstructor
public class AdminDepartmentController {

    private final DepartmentServicePort departmentService;

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentService.getAllDepartments());
    }

    @GetMapping("/{code}")
    public ResponseEntity<Department> getDepartment(@PathVariable String code) {
        try {
            return ResponseEntity.ok(departmentService.getDepartment(code));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<?> createDepartment(@RequestBody Department department) {
        try {
            Department created = departmentService.createDepartment(department);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{code}")
    public ResponseEntity<?> updateDepartment(
            @PathVariable String code,
            @RequestBody Department department) {
        try {
            Department updated = departmentService.updateDepartment(code, department);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<?> deleteDepartment(@PathVariable String code) {
        try {
            departmentService.deleteDepartment(code);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
