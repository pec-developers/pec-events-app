package com.pecdevelopers.events.service.port;

import com.pecdevelopers.events.model.entity.Event;
import java.util.List;
import java.util.UUID;

public interface EventServicePort {
    List<Event> listEventsForUser(UUID userId);
    Event createEvent(Event event, UUID creatorId);
    Event updateEvent(UUID eventId, Event eventDetails, UUID updaterId);
    void deleteEvent(UUID eventId, UUID deleterId);
    void publishEvent(UUID eventId, UUID publisherId);
    Event getEventById(UUID eventId);
}
