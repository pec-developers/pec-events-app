package com.pecdevelopers.events.service;

import com.pecdevelopers.events.model.entity.Event;
import com.pecdevelopers.events.model.entity.Registration;
import com.pecdevelopers.events.model.entity.User;
import com.pecdevelopers.events.repository.EventRepository;
import com.pecdevelopers.events.repository.RegistrationRepository;
import com.pecdevelopers.events.repository.UserRepository;
import com.pecdevelopers.events.service.port.RegistrationServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RegistrationService implements RegistrationServicePort {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public Registration registerStudent(UUID eventId, UUID studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Student profile not found."));

        String role = student.getRole().toUpperCase();
        if (!role.equals("STUDENT") && !role.equals("STUDENT_COORDINATOR") && !role.equals("FACULTY")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only students or faculty are eligible to register.");
        }

        // Row lock the event for safety under concurrent access
        Event event = eventRepository.findByIdForUpdate(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        if (!event.getActive() || !"PUBLISHED".equalsIgnoreCase(event.getStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This event is not open for registration.");
        }

        // Verify department scope
        if ("ONLY_DEPT".equalsIgnoreCase(event.getDepartmentScope())) {
            if (event.getDepartment() == null || !event.getDepartment().equalsIgnoreCase(student.getDepartment())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "This event is locked to " + event.getDepartment() + " department students only.");
            }
        }

        // Check if student is already registered
        boolean alreadyRegistered = registrationRepository.findByStudentId(studentId).stream()
                .anyMatch(r -> r.getEvent().getId().equals(eventId));
        if (alreadyRegistered) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already registered for this event.");
        }

        // Count current confirmed slots
        long confirmedCount = registrationRepository.countByEventIdAndStatusIn(eventId, List.of("CONFIRMED"));

        String registrationStatus = "CONFIRMED";
        if (confirmedCount >= event.getCapacity()) {
            registrationStatus = "WAITING_LIST";
        }

        Registration registration = Registration.builder()
                .student(student)
                .event(event)
                .status(registrationStatus)
                .build();

        return registrationRepository.save(registration);
    }

    @Override
    @Transactional
    public void cancelRegistration(UUID registrationId, UUID studentId) {
        User requester = userRepository.findById(studentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User profile not found."));

        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found."));

        // Validate access: must be student themselves, or Admin/SPOC/Coordinator of that event department
        boolean isOwner = registration.getStudent().getId().equals(studentId);
        boolean isAdmin = "ADMIN".equalsIgnoreCase(requester.getRole());
        boolean isDeptSpoc = "SPOC".equalsIgnoreCase(requester.getRole()) && 
                            requester.getDepartment() != null && 
                            requester.getDepartment().equalsIgnoreCase(registration.getEvent().getDepartment());
        boolean isDeptCoordinator = ("FACULTY_COORDINATOR".equalsIgnoreCase(requester.getRole()) || "STUDENT_COORDINATOR".equalsIgnoreCase(requester.getRole())) &&
                            requester.getDepartment() != null && 
                            requester.getDepartment().equalsIgnoreCase(registration.getEvent().getDepartment());

        if (!isOwner && !isAdmin && !isDeptSpoc && !isDeptCoordinator) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to cancel this registration.");
        }

        UUID eventId = registration.getEvent().getId();
        String oldStatus = registration.getStatus();

        // Lock event
        eventRepository.findByIdForUpdate(eventId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        // Delete registration
        registrationRepository.delete(registration);

        // If a confirmed slot is cancelled, promote the first candidate from the waiting list
        if ("CONFIRMED".equalsIgnoreCase(oldStatus)) {
            Optional<Registration> waitlistCandidate = registrationRepository
                    .findFirstByEventIdAndStatusOrderByCreatedAtAsc(eventId, "WAITING_LIST");
            if (waitlistCandidate.isPresent()) {
                Registration candidate = waitlistCandidate.get();
                candidate.setStatus("CONFIRMED");
                registrationRepository.save(candidate);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<Registration> listRegistrationsForEvent(UUID eventId, UUID requesterId) {
        User requester = userRepository.findById(requesterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User profile not found."));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        String role = requester.getRole().toUpperCase();
        String dept = requester.getDepartment();

        boolean isAdmin = role.equals("ADMIN");
        boolean isSpoc = role.equals("SPOC") && dept != null && dept.equalsIgnoreCase(event.getDepartment());
        boolean isCoordinator = (role.equals("FACULTY_COORDINATOR") || role.equals("STUDENT_COORDINATOR")) &&
                                dept != null && dept.equalsIgnoreCase(event.getDepartment());

        if (!isAdmin && !isSpoc && !isCoordinator) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have permission to audit registrations for this event.");
        }

        return registrationRepository.findByEventId(eventId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Registration> listMyRegistrations(UUID studentId) {
        return registrationRepository.findByStudentId(studentId);
    }
}
