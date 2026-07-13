package com.pecdevelopers.events.service;

import com.pecdevelopers.events.model.entity.Event;
import com.pecdevelopers.events.model.entity.User;
import com.pecdevelopers.events.repository.EventRepository;
import com.pecdevelopers.events.repository.UserRepository;
import com.pecdevelopers.events.service.port.EventServicePort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService implements EventServicePort {

    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Event> listEventsForUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User profile not found."));

        List<Event> allEvents = eventRepository.findAll();
        String role = user.getRole().toUpperCase();
        String dept = user.getDepartment();

        if (role.equals("ADMIN") || role.equals("SPOC")) {
            return allEvents;
        }

        if (role.equals("STUDENT_COORDINATOR") || role.equals("FACULTY_COORDINATOR")) {
            return allEvents.stream()
                    .filter(e -> e.getActive() != null && e.getActive())
                    .filter(e -> "PUBLISHED".equalsIgnoreCase(e.getStatus()) ||
                            ("DRAFT".equalsIgnoreCase(e.getStatus()) && e.getDepartment() != null && e.getDepartment().equalsIgnoreCase(dept)))
                    .toList();
        }

        // Student / Faculty participants
        return allEvents.stream()
                .filter(e -> e.getActive() != null && e.getActive())
                .filter(e -> "PUBLISHED".equalsIgnoreCase(e.getStatus()))
                .filter(e -> {
                    if ("ONLY_DEPT".equalsIgnoreCase(e.getDepartmentScope())) {
                        return e.getDepartment() != null && e.getDepartment().equalsIgnoreCase(dept);
                    }
                    return true;
                })
                .toList();
    }

    @Override
    @Transactional
    public Event createEvent(Event event, UUID creatorId) {
        User creator = userRepository.findById(creatorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Creator profile not found."));

        String role = creator.getRole().toUpperCase();
        
        // Enforce draft status if Student Coordinator
        if (role.equals("STUDENT_COORDINATOR")) {
            event.setStatus("DRAFT");
        }

        event.setCreator(creator);
        event.setDepartment(creator.getDepartment());
        event.setActive(true);

        return eventRepository.save(event);
    }

    @Override
    @Transactional
    public Event updateEvent(UUID eventId, Event eventDetails, UUID updaterId) {
        User updater = userRepository.findById(updaterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Updater profile not found."));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        validateWritePermission(event, updater);

        event.setTitle(eventDetails.getTitle());
        event.setDescription(eventDetails.getDescription());
        event.setCapacity(eventDetails.getCapacity());
        event.setPrice(eventDetails.getPrice());
        event.setDate(eventDetails.getDate());
        event.setDepartmentScope(eventDetails.getDepartmentScope());
        event.setBannerImageUrl(eventDetails.getBannerImageUrl());
        event.setPosterImageUrl(eventDetails.getPosterImageUrl());
        event.setEventPhotosUrls(eventDetails.getEventPhotosUrls());

        // Keep status draft if updated by student coordinator
        if (updater.getRole().toUpperCase().equals("STUDENT_COORDINATOR")) {
            event.setStatus("DRAFT");
        }

        return eventRepository.save(event);
    }

    @Override
    @Transactional
    public void deleteEvent(UUID eventId, UUID deleterId) {
        User deleter = userRepository.findById(deleterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Deleter profile not found."));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        validateWritePermission(event, deleter);

        event.setActive(false);
        eventRepository.save(event);
    }

    @Override
    @Transactional
    public void publishEvent(UUID eventId, UUID publisherId) {
        User publisher = userRepository.findById(publisherId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Publisher profile not found."));

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        validateWritePermission(event, publisher);

        event.setStatus("PUBLISHED");
        eventRepository.save(event);
    }

    @Override
    @Transactional(readOnly = true)
    public Event getEventById(UUID eventId) {
        return eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));
    }

    private void validateWritePermission(Event event, User user) {
        String role = user.getRole().toUpperCase();
        if (role.equals("ADMIN")) {
            return;
        }

        String dept = user.getDepartment();
        if (role.equals("SPOC")) {
            if (event.getDepartment() != null && event.getDepartment().equalsIgnoreCase(dept)) {
                return;
            }
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "SPOC can only modify events of their own department.");
        }

        if (role.equals("FACULTY_COORDINATOR") || role.equals("STUDENT_COORDINATOR")) {
            if (event.getDepartment() == null || !event.getDepartment().equalsIgnoreCase(dept)) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Coordinators can only modify events of their own department.");
            }
            if (role.equals("STUDENT_COORDINATOR") && !"DRAFT".equalsIgnoreCase(event.getStatus())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Student Coordinators can only modify draft events.");
            }
            return;
        }

        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not have write access to this event.");
    }
}
