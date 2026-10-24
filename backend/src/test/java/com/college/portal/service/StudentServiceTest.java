package com.college.portal.service;

import com.college.portal.dto.DashboardStatsResponse;
import com.college.portal.dto.DepartmentCount;
import com.college.portal.dto.StudentRequest;
import com.college.portal.dto.StudentResponse;
import com.college.portal.exception.EmailAlreadyExistsException;
import com.college.portal.exception.ResourceNotFoundException;
import com.college.portal.model.Student;
import com.college.portal.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentServiceTest {

    @Mock
    private StudentRepository studentRepository;

    @InjectMocks
    private StudentServiceImpl studentService;

    private Student student;
    private StudentRequest studentRequest;

    @BeforeEach
    void setUp() {
        student = new Student("John Doe", "john.doe@college.edu", "Computer Science", "3rd Year", "+1-555-1234");
        student.setId(1L);

        studentRequest = new StudentRequest("John Doe", "john.doe@college.edu", "Computer Science", "3rd Year", "+1-555-1234");
    }

    @Test
    void testGetAllStudents() {
        when(studentRepository.filterAndSearchStudents(null, null)).thenReturn(List.of(student));

        List<StudentResponse> results = studentService.getAllStudents(null, null);

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals("John Doe", results.get(0).getFullName());
        verify(studentRepository, times(1)).filterAndSearchStudents(null, null);
    }

    @Test
    void testGetStudentById_Success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));

        StudentResponse response = studentService.getStudentById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("john.doe@college.edu", response.getEmail());
    }

    @Test
    void testGetStudentById_NotFound() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> studentService.getStudentById(99L));
    }

    @Test
    void testCreateStudent_Success() {
        when(studentRepository.existsByEmail("john.doe@college.edu")).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        StudentResponse response = studentService.createStudent(studentRequest);

        assertNotNull(response);
        assertEquals("John Doe", response.getFullName());
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    void testCreateStudent_DuplicateEmailThrowsException() {
        when(studentRepository.existsByEmail("john.doe@college.edu")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> studentService.createStudent(studentRequest));
        verify(studentRepository, never()).save(any(Student.class));
    }

    @Test
    void testUpdateStudent_Success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(studentRepository.existsByEmailAndIdNot("john.doe@college.edu", 1L)).thenReturn(false);
        when(studentRepository.save(any(Student.class))).thenReturn(student);

        StudentResponse response = studentService.updateStudent(1L, studentRequest);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        verify(studentRepository, times(1)).save(any(Student.class));
    }

    @Test
    void testDeleteStudent_Success() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        doNothing().when(studentRepository).delete(student);

        assertDoesNotThrow(() -> studentService.deleteStudent(1L));
        verify(studentRepository, times(1)).delete(student);
    }

    @Test
    void testGetDashboardStats() {
        when(studentRepository.count()).thenReturn(10L);
        when(studentRepository.countStudentsByDepartment()).thenReturn(Arrays.asList(
                new DepartmentCount("Computer Science", 6L),
                new DepartmentCount("Information Technology", 4L)
        ));
        when(studentRepository.findTop5ByOrderByCreatedAtDesc()).thenReturn(List.of(student));

        DashboardStatsResponse stats = studentService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(10L, stats.getTotalStudents());
        assertEquals(2, stats.getDepartmentCounts().size());
        assertEquals(1, stats.getRecentStudents().size());
    }
}
