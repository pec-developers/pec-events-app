package com.pecdevelopers.events.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecdevelopers.events.config.SupabaseProperties;
import com.pecdevelopers.events.model.dto.RegisterRequest;
import com.pecdevelopers.events.model.dto.UserResponse;
import com.pecdevelopers.events.service.port.AuthServicePort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminUserController.class)
public class AdminUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private AuthServicePort authService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    @Test
    public void testListSpocs_Success() throws Exception {
        UserResponse response = new UserResponse(UUID.randomUUID(), "SPOC CSE", "spoc@pec.edu", "SPOC", "CSE", "PEC-100");
        when(authService.listUsersByRole("SPOC")).thenReturn(List.of(response));

        mockMvc.perform(get("/api/admin/spocs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("SPOC CSE"));
    }

    @Test
    public void testCreateSpoc_Success() throws Exception {
        AdminUserController.SpocCreateRequest request = new AdminUserController.SpocCreateRequest(
                "spoc@pec.edu", "pass", "SPOC CSE", "PEC-100", "+919", "CSE"
        );
        UserResponse response = new UserResponse(UUID.randomUUID(), "SPOC CSE", "spoc@pec.edu", "SPOC", "CSE", "PEC-100");

        when(authService.createSpoc(any(RegisterRequest.class), eq("CSE"))).thenReturn(response);

        mockMvc.perform(post("/api/admin/spocs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("spoc@pec.edu"));
    }

    @Test
    public void testDeleteSpoc_Success() throws Exception {
        UUID id = UUID.randomUUID();
        doNothing().when(authService).deleteUser(id);

        mockMvc.perform(delete("/api/admin/spocs/" + id))
                .andExpect(status().isOk());
    }
}
