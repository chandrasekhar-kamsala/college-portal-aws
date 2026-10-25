package com.college.portal.controller;

import com.college.portal.dto.DashboardStatsResponse;
import com.college.portal.dto.DepartmentCount;
import com.college.portal.dto.StudentRequest;
import com.college.portal.dto.StudentResponse;
import com.college.portal.exception.ResourceNotFoundException;
import com.college.portal.model.Student;
import com.college.portal.service.StudentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import com.college.portal.security.JwtService;

import java.util.List;

@WebMvcTest(StudentController.class)
@AutoConfigureMockMvc(addFilters = false)
class StudentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private StudentService studentService;

    @MockBean
    private JwtService jwtService;

    @Autowired
    private ObjectMapper objectMapper;

    private StudentResponse studentResponse;
    private StudentRequest validRequest;

    @BeforeEach
    void setUp() {
        Student student = new Student("Alice Walker", "alice.w@college.edu", "Computer Science", "2nd Year", "+1-555-4321");
        student.setId(10L);
        studentResponse = new StudentResponse(student);

        validRequest = new StudentRequest("Alice Walker", "alice.w@college.edu", "Computer Science", "2nd Year", "+1-555-4321");
    }

    @Test
    void testGetAllStudents() throws Exception {
        when(studentService.getAllStudents(null, null)).thenReturn(List.of(studentResponse));

        mockMvc.perform(get("/api/students"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].fullName", is("Alice Walker")))
                .andExpect(jsonPath("$[0].email", is("alice.w@college.edu")));
    }

    @Test
    void testGetStudentById_Success() throws Exception {
        when(studentService.getStudentById(10L)).thenReturn(studentResponse);

        mockMvc.perform(get("/api/students/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.fullName", is("Alice Walker")));
    }

    @Test
    void testGetStudentById_NotFound() throws Exception {
        when(studentService.getStudentById(999L)).thenThrow(new ResourceNotFoundException("Student not found with ID: 999"));

        mockMvc.perform(get("/api/students/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", is("Student not found with ID: 999")));
    }

    @Test
    void testCreateStudent_Success() throws Exception {
        when(studentService.createStudent(any(StudentRequest.class))).thenReturn(studentResponse);

        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.fullName", is("Alice Walker")));
    }

    @Test
    void testCreateStudent_ValidationError() throws Exception {
        StudentRequest invalidRequest = new StudentRequest("", "invalid-email", "", "", "123");

        mockMvc.perform(post("/api/students")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status", is(400)))
                .andExpect(jsonPath("$.validationErrors.fullName").exists())
                .andExpect(jsonPath("$.validationErrors.email").exists());

        verify(studentService, never()).createStudent(any(StudentRequest.class));
    }

    @Test
    void testUpdateStudent_Success() throws Exception {
        when(studentService.updateStudent(eq(10L), any(StudentRequest.class))).thenReturn(studentResponse);

        mockMvc.perform(put("/api/students/10")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(10)))
                .andExpect(jsonPath("$.fullName", is("Alice Walker")));
    }

    @Test
    void testDeleteStudent_Success() throws Exception {
        doNothing().when(studentService).deleteStudent(10L);

        mockMvc.perform(delete("/api/students/10"))
                .andExpect(status().isNoContent());

        verify(studentService, times(1)).deleteStudent(10L);
    }

    @Test
    void testGetDashboardStats() throws Exception {
        DashboardStatsResponse stats = new DashboardStatsResponse(
                1L,
                List.of(new DepartmentCount("Computer Science", 1L)),
                List.of(studentResponse)
        );

        when(studentService.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/api/students/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalStudents", is(1)))
                .andExpect(jsonPath("$.departmentCounts", hasSize(1)));
    }
}
