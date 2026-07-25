package com.pecdevelopers.events.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecdevelopers.events.config.SupabaseProperties;
import com.pecdevelopers.events.model.entity.SystemConfiguration;
import com.pecdevelopers.events.model.enums.SystemConfigKey;
import com.pecdevelopers.events.service.port.SystemConfigurationServicePort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

// import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminConfigController.class)
public class AdminConfigControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private SystemConfigurationServicePort configurationService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    @Test
    public void testGetAllConfigs_Success() throws Exception {
        SystemConfiguration config = SystemConfiguration.builder()
                .key(SystemConfigKey.MAX_SPOCS_PER_DEPT.name())
                .value(1)
                .description("Max SPOCs per department")
                .build();

        when(configurationService.getAllConfigurations()).thenReturn(List.of(config));

        mockMvc.perform(get("/api/admin/config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].key").value("MAX_SPOCS_PER_DEPT"))
                .andExpect(jsonPath("$[0].value").value(1));
    }

    @Test
    public void testUpdateConfig_Success() throws Exception {
        AdminConfigController.ConfigUpdateRequest updateRequest = new AdminConfigController.ConfigUpdateRequest(5);
        doNothing().when(configurationService).updateConfigurationValue(eq(SystemConfigKey.MAX_SPOCS_PER_DEPT), eq(5));

        mockMvc.perform(put("/api/admin/config/MAX_SPOCS_PER_DEPT")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk());
    }
}
