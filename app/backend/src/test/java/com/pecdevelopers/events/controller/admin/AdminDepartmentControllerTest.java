package com.pecdevelopers.events.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pecdevelopers.events.config.SupabaseProperties;
import com.pecdevelopers.events.model.entity.Department;
import com.pecdevelopers.events.service.port.DepartmentServicePort;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminDepartmentController.class)
public class AdminDepartmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    @MockitoBean
    private DepartmentServicePort departmentService;

    @MockitoBean
    private SupabaseProperties supabaseProperties;

    @Test
    public void testGetAllDepartments_Success() throws Exception {
        Department dept = Department.builder()
                .code("CSE")
                .name("Computer Science")
                .build();

        when(departmentService.getAllDepartments()).thenReturn(List.of(dept));

        mockMvc.perform(get("/api/admin/departments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].code").value("CSE"))
                .andExpect(jsonPath("$[0].name").value("Computer Science"));
    }

    @Test
    public void testCreateDepartment_Success() throws Exception {
        Department dept = Department.builder()
                .code("CSE")
                .name("Computer Science")
                .build();

        when(departmentService.createDepartment(any(Department.class))).thenReturn(dept);

        mockMvc.perform(post("/api/admin/departments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dept)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("CSE"));
    }

    @Test
    public void testDeleteDepartment_Success() throws Exception {
        doNothing().when(departmentService).deleteDepartment(eq("CSE"));

        mockMvc.perform(delete("/api/admin/departments/CSE"))
                .andExpect(status().isOk());
    }
}
