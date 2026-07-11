package com.pecdevelopers.events.controller.shared;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecdevelopers.events.config.SupabaseProperties;
import com.pecdevelopers.events.model.dto.*;
import com.pecdevelopers.events.service.port.AuthServicePort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
public class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private AuthServicePort authService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    @Test
    public void testLogin_Success() throws Exception {
        LoginRequest loginRequest = new LoginRequest("test@pec.edu", "password123");
        AuthResponse authResponse = new AuthResponse(
                UUID.randomUUID(),
                "John Doe",
                "test@pec.edu",
                "STUDENT",
                "CSE",
                "PEC-100234",
                "mock-access-token"
        );

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("test@pec.edu"))
                .andExpect(jsonPath("$.role").value("STUDENT"))
                .andExpect(jsonPath("$.accessToken").value("mock-access-token"));
    }

    @Test
    public void testRegister_Success() throws Exception {
        RegisterRequest registerRequest = new RegisterRequest("PEC-100234", "test@pec.edu", "+919876543210", "John Doe", "password123");
        AuthResponse authResponse = new AuthResponse(
                UUID.randomUUID(),
                "John Doe",
                "test@pec.edu",
                "STUDENT",
                "CSE",
                "PEC-100234",
                "mock-access-token"
        );

        when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("John Doe"))
                .andExpect(jsonPath("$.email").value("test@pec.edu"))
                .andExpect(jsonPath("$.role").value("STUDENT"));
    }
}
