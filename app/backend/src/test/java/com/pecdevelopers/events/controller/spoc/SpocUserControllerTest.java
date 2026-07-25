package com.pecdevelopers.events.controller.spoc;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecdevelopers.events.config.SupabaseProperties;
import com.pecdevelopers.events.model.dto.RegisterRequest;
import com.pecdevelopers.events.model.dto.UserResponse;
import com.pecdevelopers.events.model.entity.EligibleEnrollment;
import com.pecdevelopers.events.service.port.AuthServicePort;
import com.pecdevelopers.events.service.port.EligibleEnrollmentServicePort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

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

@WebMvcTest(SpocUserController.class)
public class SpocUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private AuthServicePort authService;

    @MockitoBean
    private EligibleEnrollmentServicePort eligibleEnrollmentService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    @Test
    public void testListCoordinators_Success() throws Exception {
        UUID spocId = UUID.randomUUID();
        UserResponse spoc = new UserResponse(spocId, "SPOC", "spoc@pec.edu", "SPOC", "CSE", "PEC-100");
        UserResponse coordinator = new UserResponse(UUID.randomUUID(), "Coord", "coord@pec.edu", "STUDENT_COORDINATOR", "CSE", "PEC-101");

        when(authService.getActiveUser(spocId)).thenReturn(spoc);
        when(authService.listCoordinatorsByDepartment("CSE")).thenReturn(List.of(coordinator));

        mockMvc.perform(get("/api/spoc/coordinators")
                        .requestAttr("userId", spocId.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Coord"));
    }

    @Test
    public void testCreateCoordinator_Success() throws Exception {
        UUID spocId = UUID.randomUUID();
        UserResponse spoc = new UserResponse(spocId, "SPOC", "spoc@pec.edu", "SPOC", "CSE", "PEC-100");
        SpocUserController.CoordinatorCreateRequest req = new SpocUserController.CoordinatorCreateRequest(
                "coord@pec.edu", "pass", "Coord", "PEC-101", "+919", "STUDENT_COORDINATOR"
        );
        UserResponse coordinator = new UserResponse(UUID.randomUUID(), "Coord", "coord@pec.edu", "STUDENT_COORDINATOR", "CSE", "PEC-101");

        when(authService.getActiveUser(spocId)).thenReturn(spoc);
        when(authService.createCoordinator(any(RegisterRequest.class), eq("STUDENT_COORDINATOR"), eq("CSE"))).thenReturn(coordinator);

        mockMvc.perform(post("/api/spoc/coordinators")
                        .requestAttr("userId", spocId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.role").value("STUDENT_COORDINATOR"));
    }

    @Test
    public void testDeleteCoordinator_Success() throws Exception {
        UUID spocId = UUID.randomUUID();
        UUID coordId = UUID.randomUUID();
        UserResponse spoc = new UserResponse(spocId, "SPOC", "spoc@pec.edu", "SPOC", "CSE", "PEC-100");
        UserResponse coordinator = new UserResponse(coordId, "Coord", "coord@pec.edu", "STUDENT_COORDINATOR", "CSE", "PEC-101");

        when(authService.getActiveUser(spocId)).thenReturn(spoc);
        when(authService.getActiveUser(coordId)).thenReturn(coordinator);
        doNothing().when(authService).deleteUser(coordId);

        mockMvc.perform(delete("/api/spoc/coordinators/" + coordId)
                        .requestAttr("userId", spocId.toString()))
                .andExpect(status().isOk());
    }

    @Test
    public void testSeedEnrollments_Success() throws Exception {
        UUID spocId = UUID.randomUUID();
        UserResponse spoc = new UserResponse(spocId, "SPOC", "spoc@pec.edu", "SPOC", "CSE", "PEC-100");
        EligibleEnrollment enrollment = EligibleEnrollment.builder()
                .registrationNumber("PEC-105")
                .name("Student Five")
                .email("student5@pec.edu")
                .department("CSE")
                .role("STUDENT")
                .build();

        when(authService.getActiveUser(spocId)).thenReturn(spoc);
        doNothing().when(eligibleEnrollmentService).seedEligibleEnrollments(anyList(), eq("CSE"));

        mockMvc.perform(post("/api/spoc/users/seed")
                        .requestAttr("userId", spocId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(enrollment))))
                .andExpect(status().isOk());
    }
}
