package com.pecdevelopers.events.controller.admin;

import com.pecdevelopers.events.annotation.RequiresRole;
import com.pecdevelopers.events.model.dto.RegisterRequest;
import com.pecdevelopers.events.model.dto.UserResponse;
import com.pecdevelopers.events.service.port.AuthServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/spocs")
@RequiredArgsConstructor
@RequiresRole({"ADMIN"})
public class AdminUserController {

    private final AuthServicePort authService;

    public record SpocCreateRequest(
        String email,
        String password,
        String name,
        String registrationNumber,
        String phoneNumber,
        String department
    ) {}

    @GetMapping
    public ResponseEntity<List<UserResponse>> listSpocs() {
        return ResponseEntity.ok(authService.listUsersByRole("SPOC"));
    }

    @PostMapping
    public ResponseEntity<UserResponse> createSpoc(@RequestBody SpocCreateRequest request) {
        RegisterRequest registerRequest = new RegisterRequest(
            request.registrationNumber(),
            request.email(),
            request.phoneNumber(),
            request.name(),
            request.password()
        );
        UserResponse created = authService.createSpoc(registerRequest, request.department());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpoc(@PathVariable UUID id) {
        authService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}
