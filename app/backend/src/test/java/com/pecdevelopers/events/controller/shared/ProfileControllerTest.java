package com.pecdevelopers.events.controller.shared;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecdevelopers.events.config.SupabaseProperties;
import com.pecdevelopers.events.model.dto.ProfileUpdateRequest;
import com.pecdevelopers.events.model.dto.UserResponse;
import com.pecdevelopers.events.service.port.AuthServicePort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProfileController.class)
public class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private AuthServicePort authService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    @Test
    public void testUpdateProfile_Success() throws Exception {
        UUID userId = UUID.randomUUID();
        ProfileUpdateRequest request = new ProfileUpdateRequest("Jane Doe", "jane@pec.edu", "+919876543211", "https://example.com/avatar.png");
        UserResponse response = new UserResponse(userId, "Jane Doe", "jane@pec.edu", "STUDENT", "CSE", "PEC-100234");

        when(authService.updateProfile(eq(userId), any(ProfileUpdateRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/profile")
                        .requestAttr("userId", userId.toString())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Jane Doe"))
                .andExpect(jsonPath("$.email").value("jane@pec.edu"));
    }
}
