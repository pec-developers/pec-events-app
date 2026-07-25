package com.pecdevelopers.events.controller.shared;

import com.pecdevelopers.events.annotation.RequiresRole;
import com.pecdevelopers.events.model.dto.CreateEventRequest;
import com.pecdevelopers.events.model.dto.EventResponse;
import com.pecdevelopers.events.model.entity.Event;
import com.pecdevelopers.events.repository.RegistrationRepository;
import com.pecdevelopers.events.service.port.EventServicePort;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventServicePort eventService;
    private final RegistrationRepository registrationRepository;

    @GetMapping
    public ResponseEntity<List<EventResponse>> listEvents(HttpServletRequest request) {
        UUID userId = getRequesterUserId(request);
        List<Event> events = eventService.listEventsForUser(userId);
        List<EventResponse> responses = events.stream()
                .map(this::mapToEventResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping
    @RequiresRole({"ADMIN", "SPOC", "STUDENT_COORDINATOR", "FACULTY_COORDINATOR"})
    public ResponseEntity<EventResponse> createEvent(
            HttpServletRequest request,
            @RequestBody CreateEventRequest req
    ) {
        UUID userId = getRequesterUserId(request);
        Event event = Event.builder()
                .title(req.title())
                .description(req.description())
                .capacity(req.capacity())
                .price(req.price())
                .date(parseDateTime(req.date()))
                .departmentScope(req.departmentScope() != null ? req.departmentScope() : "ALL_DEPTS")
                .bannerImageUrl(req.bannerImageUrl())
                .posterImageUrl(req.posterImageUrl())
                .eventPhotosUrls(req.eventPhotosUrls())
                .status(req.isDraft() != null && req.isDraft() ? "DRAFT" : "PUBLISHED")
                .build();

        Event created = eventService.createEvent(event, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapToEventResponse(created));
    }

    @PutMapping("/{id}")
    @RequiresRole({"ADMIN", "SPOC", "STUDENT_COORDINATOR", "FACULTY_COORDINATOR"})
    public ResponseEntity<EventResponse> updateEvent(
            HttpServletRequest request,
            @PathVariable UUID id,
            @RequestBody CreateEventRequest req
    ) {
        UUID userId = getRequesterUserId(request);
        Event eventDetails = Event.builder()
                .title(req.title())
                .description(req.description())
                .capacity(req.capacity())
                .price(req.price())
                .date(parseDateTime(req.date()))
                .departmentScope(req.departmentScope() != null ? req.departmentScope() : "ALL_DEPTS")
                .bannerImageUrl(req.bannerImageUrl())
                .posterImageUrl(req.posterImageUrl())
                .eventPhotosUrls(req.eventPhotosUrls())
                .build();

        Event updated = eventService.updateEvent(id, eventDetails, userId);
        return ResponseEntity.ok(mapToEventResponse(updated));
    }

    @DeleteMapping("/{id}")
    @RequiresRole({"ADMIN", "SPOC", "STUDENT_COORDINATOR", "FACULTY_COORDINATOR"})
    public ResponseEntity<Void> deleteEvent(
            HttpServletRequest request,
            @PathVariable UUID id
    ) {
        UUID userId = getRequesterUserId(request);
        eventService.deleteEvent(id, userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/publish")
    @RequiresRole({"ADMIN", "SPOC", "STUDENT_COORDINATOR", "FACULTY_COORDINATOR"})
    public ResponseEntity<Void> publishEvent(
            HttpServletRequest request,
            @PathVariable UUID id
    ) {
        UUID userId = getRequesterUserId(request);
        eventService.publishEvent(id, userId);
        return ResponseEntity.ok().build();
    }

    private EventResponse mapToEventResponse(Event e) {
        long regCount = registrationRepository.countByEventIdAndStatusIn(e.getId(), List.of("CONFIRMED"));
        return new EventResponse(
                e.getId(),
                e.getTitle(),
                e.getDescription(),
                e.getCapacity(),
                e.getActive(),
                e.getDate() != null ? e.getDate().toString() + "Z" : null,
                e.getCreator() != null ? e.getCreator().getId() : null,
                regCount,
                e.getPrice(),
                e.getDepartmentScope(),
                e.getDepartment(),
                e.getStatus(),
                e.getBannerImageUrl(),
                e.getPosterImageUrl(),
                e.getEventPhotosUrls()
        );
    }

    private LocalDateTime parseDateTime(String dateStr) {
        if (dateStr == null || dateStr.trim().isEmpty()) {
            return LocalDateTime.now().plusDays(7); // default fallback
        }
        try {
            return java.time.OffsetDateTime.parse(dateStr).toLocalDateTime();
        } catch (Exception e) {
            try {
                return LocalDateTime.parse(dateStr);
            } catch (Exception ex) {
                // If timestamp ends with 'Z' but doesn't have offset offset representation, manually trim it
                if (dateStr.endsWith("Z")) {
                    try {
                        return LocalDateTime.parse(dateStr.substring(0, dateStr.length() - 1));
                    } catch (Exception e3) {
                        // ignore
                    }
                }
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid date format: " + dateStr);
            }
        }
    }

    private UUID getRequesterUserId(HttpServletRequest request) {
        Object userIdAttr = request.getAttribute("userId");
        if (userIdAttr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User context is missing.");
        }
        return UUID.fromString(userIdAttr.toString());
    }
}
