package com.pecdevelopers.events.controller.shared;

// import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecdevelopers.events.config.SupabaseProperties;
// import com.pecdevelopers.events.model.dto.RegistrationDetailResponse;
import com.pecdevelopers.events.model.entity.Event;
import com.pecdevelopers.events.model.entity.Registration;
import com.pecdevelopers.events.model.entity.User;
import com.pecdevelopers.events.service.port.RegistrationServicePort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

// import static org.mockito.ArgumentMatchers.any;
// import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RegistrationController.class)
public class RegistrationControllerTest {

    @Autowired
    private MockMvc mockMvc;

//     private final ObjectMapper objectMapper = new ObjectMapper()
//             .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private RegistrationServicePort registrationService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    @Test
    public void testRegister_Success() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        Registration registration = Registration.builder()
                .id(UUID.randomUUID())
                .status("CONFIRMED")
                .build();

        when(registrationService.registerStudent(eventId, studentId)).thenReturn(registration);

        mockMvc.perform(post("/api/events/" + eventId + "/register")
                        .requestAttr("userId", studentId.toString()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("CONFIRMED"));
    }

    @Test
    public void testGetMyRegistrations_Success() throws Exception {
        UUID studentId = UUID.randomUUID();
        Event event = Event.builder().id(UUID.randomUUID()).title("Tech Talk").build();
        User student = User.builder().id(studentId).build();
        Registration registration = Registration.builder()
                .id(UUID.randomUUID())
                .event(event)
                .student(student)
                .status("CONFIRMED")
                .createdAt(LocalDateTime.now())
                .build();

        when(registrationService.listMyRegistrations(studentId)).thenReturn(List.of(registration));

        mockMvc.perform(get("/api/registrations/me")
                        .requestAttr("userId", studentId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].eventTitle").value("Tech Talk"));
    }

    @Test
    public void testCancelRegistration_Success() throws Exception {
        UUID studentId = UUID.randomUUID();
        UUID regId = UUID.randomUUID();
        doNothing().when(registrationService).cancelRegistration(regId, studentId);

        mockMvc.perform(delete("/api/registrations/" + regId + "/cancel")
                        .requestAttr("userId", studentId.toString()))
                .andExpect(status().isOk());
    }

    @Test
    public void testGetEventRegistrations_Success() throws Exception {
        UUID requesterId = UUID.randomUUID();
        UUID eventId = UUID.randomUUID();
        Event event = Event.builder().id(eventId).title("Workshop").build();
        User student = User.builder()
                .id(UUID.randomUUID())
                .name("Alice")
                .email("alice@pec.edu")
                .registrationNumber("PEC-001")
                .department("CSE")
                .build();

        Registration registration = Registration.builder()
                .id(UUID.randomUUID())
                .event(event)
                .student(student)
                .status("CONFIRMED")
                .createdAt(LocalDateTime.now())
                .build();

        when(registrationService.listRegistrationsForEvent(eventId, requesterId)).thenReturn(List.of(registration));

        mockMvc.perform(get("/api/events/" + eventId + "/registrations")
                        .requestAttr("userId", requesterId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].studentName").value("Alice"))
                .andExpect(jsonPath("$[0].studentRegNum").value("PEC-001"));
    }
}
