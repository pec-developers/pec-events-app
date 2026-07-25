package com.pecdevelopers.events.controller.shared;

import com.pecdevelopers.events.model.dto.RegistrationDetailResponse;
import com.pecdevelopers.events.model.dto.RegistrationResponse;
import com.pecdevelopers.events.model.entity.Registration;
import com.pecdevelopers.events.service.port.RegistrationServicePort;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RegistrationController {

    private final RegistrationServicePort registrationService;

    public record RegisterEventResponse(
        UUID registrationId,
        String status
    ) {}

    @PostMapping("/events/{eventId}/register")
    public ResponseEntity<RegisterEventResponse> register(
            HttpServletRequest request,
            @PathVariable UUID eventId
    ) {
        UUID studentId = getRequesterUserId(request);
        Registration registration = registrationService.registerStudent(eventId, studentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(new RegisterEventResponse(
                registration.getId(),
                registration.getStatus()
        ));
    }

    @GetMapping("/registrations/me")
    public ResponseEntity<List<RegistrationResponse>> getMyRegistrations(HttpServletRequest request) {
        UUID studentId = getRequesterUserId(request);
        List<Registration> myRegs = registrationService.listMyRegistrations(studentId);
        List<RegistrationResponse> responses = myRegs.stream()
                .map(r -> new RegistrationResponse(
                        r.getId(),
                        r.getEvent().getId(),
                        r.getStudent().getId(),
                        r.getStatus(),
                        r.getCreatedAt().toString() + "Z",
                        r.getEvent().getTitle()
                ))
                .toList();
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/registrations/{id}/cancel")
    public ResponseEntity<Void> cancelRegistration(
            HttpServletRequest request,
            @PathVariable UUID id
    ) {
        UUID studentId = getRequesterUserId(request);
        registrationService.cancelRegistration(id, studentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/events/{eventId}/registrations")
    public ResponseEntity<List<RegistrationDetailResponse>> getEventRegistrations(
            HttpServletRequest request,
            @PathVariable UUID eventId
    ) {
        UUID requesterId = getRequesterUserId(request);
        List<Registration> regs = registrationService.listRegistrationsForEvent(eventId, requesterId);
        List<RegistrationDetailResponse> responses = regs.stream()
                .map(r -> new RegistrationDetailResponse(
                        r.getId(),
                        r.getEvent().getId(),
                        r.getStudent().getId(),
                        r.getStatus(),
                        r.getCreatedAt().toString() + "Z",
                        r.getStudent().getName(),
                        r.getStudent().getEmail(),
                        r.getStudent().getRegistrationNumber(),
                        r.getStudent().getDepartment()
                ))
                .toList();
        return ResponseEntity.ok(responses);
    }

    private UUID getRequesterUserId(HttpServletRequest request) {
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User context is missing.");
        }
        return UUID.fromString(userIdAttr.toString());
    }
}
