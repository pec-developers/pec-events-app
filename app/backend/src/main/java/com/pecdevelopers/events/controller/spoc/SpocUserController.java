package com.pecdevelopers.events.controller.spoc;

import com.pecdevelopers.events.annotation.RequiresRole;
import com.pecdevelopers.events.model.entity.EligibleEnrollment;
import com.pecdevelopers.events.model.dto.RegisterRequest;
import com.pecdevelopers.events.model.dto.UserResponse;
import com.pecdevelopers.events.service.port.AuthServicePort;
import com.pecdevelopers.events.service.port.EligibleEnrollmentServicePort;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/spoc")
@RequiredArgsConstructor
@RequiresRole({"SPOC"})
public class SpocUserController {

    private final AuthServicePort authService;
    private final EligibleEnrollmentServicePort eligibleEnrollmentService;

    public record CoordinatorCreateRequest(
        String email,
        String password,
        String name,
        String registrationNumber,
        String phoneNumber,
        String role
    ) {}

    @GetMapping("/coordinators")
    public ResponseEntity<List<UserResponse>> listCoordinators(HttpServletRequest request) {
        UUID spocId = getRequesterUserId(request);
        UserResponse spoc = authService.getActiveUser(spocId);
        return ResponseEntity.ok(authService.listCoordinatorsByDepartment(spoc.department()));
    }

    @PostMapping("/coordinators")
    public ResponseEntity<UserResponse> createCoordinator(
            HttpServletRequest request,
            @RequestBody CoordinatorCreateRequest req
    ) {
        UUID spocId = getRequesterUserId(request);
        UserResponse spoc = authService.getActiveUser(spocId);

        String targetRole = req.role() != null ? req.role().toUpperCase() : "";
        if (!targetRole.equals("STUDENT_COORDINATOR") && !targetRole.equals("FACULTY_COORDINATOR")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid role. Must be STUDENT_COORDINATOR or FACULTY_COORDINATOR.");
        }

        RegisterRequest registerRequest = new RegisterRequest(
            req.registrationNumber(),
            req.email(),
            req.phoneNumber(),
            req.name(),
            req.password()
        );

        UserResponse created = authService.createCoordinator(registerRequest, targetRole, spoc.department());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/coordinators/{id}")
    public ResponseEntity<Void> deleteCoordinator(
            HttpServletRequest request,
            @PathVariable UUID id
    ) {
        UUID spocId = getRequesterUserId(request);
        UserResponse spoc = authService.getActiveUser(spocId);
        UserResponse coordinator = authService.getActiveUser(id);

        if (coordinator.department() == null || !coordinator.department().equalsIgnoreCase(spoc.department())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only delete coordinators within your own department.");
        }

        authService.deleteUser(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/users/seed")
    public ResponseEntity<Void> seedEnrollments(
            HttpServletRequest request,
            @RequestBody List<EligibleEnrollment> enrollments
    ) {
        UUID spocId = getRequesterUserId(request);
        UserResponse spoc = authService.getActiveUser(spocId);

        eligibleEnrollmentService.seedEligibleEnrollments(enrollments, spoc.department());
        return ResponseEntity.ok().build();
    }

    private UUID getRequesterUserId(HttpServletRequest request) {
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User context is missing.");
        }
        return UUID.fromString(userIdAttr.toString());
    }
}
