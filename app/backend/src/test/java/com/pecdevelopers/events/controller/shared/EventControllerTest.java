package com.pecdevelopers.events.controller.shared;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecdevelopers.events.config.SupabaseProperties;
import com.pecdevelopers.events.model.dto.CreateEventRequest;
// import com.pecdevelopers.events.model.dto.EventResponse;
import com.pecdevelopers.events.model.entity.Event;
import com.pecdevelopers.events.repository.RegistrationRepository;
import com.pecdevelopers.events.service.port.EventServicePort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
public class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private EventServicePort eventService;

    @MockitoBean
    private RegistrationRepository registrationRepository;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    @Test
    public void testListEvents_Success() throws Exception {
        UUID userId = UUID.randomUUID();
        Event event = Event.builder()
                .id(UUID.randomUUID())
                .title("Tech Fest")
                .description("Coding competition")
                .capacity(100)
                .price(BigDecimal.ZERO)
                .status("PUBLISHED")
                .department("CSE")
                .departmentScope("ALL_DEPTS")
                .active(true)
                .build();

        when(eventService.listEventsForUser(userId)).thenReturn(List.of(event));
        when(registrationRepository.countByEventIdAndStatusIn(any(UUID.class), anyList())).thenReturn(10L);

        mockMvc.perform(get("/api/events")
                        .requestAttr("userId", userId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Tech Fest"))
                .andExpect(jsonPath("$[0].registrationsCount").value(10));
    }

    @Test
    public void testCreateEvent_Success() throws Exception {
        UUID userId = UUID.randomUUID();
        CreateEventRequest req = new CreateEventRequest(
                "Hackathon", "Build things", 50, "2026-07-12T18:40:35Z", BigDecimal.ZERO, "ALL_DEPTS", null, null, null, false
        );
        Event createdEvent = Event.builder()
                .id(UUID.randomUUID())
                .title("Hackathon")
                .description("Build things")
                .capacity(50)
                .price(BigDecimal.ZERO)
                .date(LocalDateTime.now())
                .status("PUBLISHED")
                .build();

        when(eventService.createEvent(any(Event.class), eq(userId))).thenReturn(createdEvent);

        mockMvc.perform(post("/api/events")
                        .requestAttr("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Hackathon"));
    }

    @Test
    public void testUpdateEvent_Success() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        CreateEventRequest req = new CreateEventRequest(
                "Hackathon Pro", "Build hard things", 50, "2026-07-12T18:40:35Z", BigDecimal.ZERO, "ALL_DEPTS", null, null, null, false
        );
        Event updatedEvent = Event.builder()
                .id(eventId)
                .title("Hackathon Pro")
                .description("Build hard things")
                .capacity(50)
                .price(BigDecimal.ZERO)
                .date(LocalDateTime.now())
                .status("PUBLISHED")
                .build();

        when(eventService.updateEvent(eq(eventId), any(Event.class), eq(userId))).thenReturn(updatedEvent);

        mockMvc.perform(put("/api/events/" + eventId)
                        .requestAttr("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Hackathon Pro"));
    }

    @Test
    public void testDeleteEvent_Success() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        doNothing().when(eventService).deleteEvent(eventId, userId);

        mockMvc.perform(delete("/api/events/" + eventId)
                        .requestAttr("userId", userId.toString()))
                .andExpect(status().isOk());
    }

    @Test
    public void testPublishEvent_Success() throws Exception {
        UUID userId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        doNothing().when(eventService).publishEvent(eventId, userId);

        mockMvc.perform(post("/api/events/" + eventId + "/publish")
                        .requestAttr("userId", userId.toString()))
                .andExpect(status().isOk());
    }
}
