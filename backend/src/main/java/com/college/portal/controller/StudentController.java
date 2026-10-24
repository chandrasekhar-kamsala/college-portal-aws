package com.college.portal.controller;

import com.college.portal.dto.DashboardStatsResponse;
import com.college.portal.dto.StudentRequest;
import com.college.portal.dto.StudentResponse;
import com.college.portal.service.StudentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class StudentController {

    private static final Logger log = LoggerFactory.getLogger(StudentController.class);

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    /**
     * Retrieve all students, optionally filtered by department and search keyword.
     */
    @GetMapping
    public ResponseEntity<List<StudentResponse>> getAllStudents(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) String search) {
        log.info("Fetching students with department='{}', search='{}'", department, search);
        List<StudentResponse> students = studentService.getAllStudents(department, search);
        return ResponseEntity.ok(students);
    }

    /**
     * Retrieve dashboard summary statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsResponse> getDashboardStats() {
        log.info("Fetching dashboard statistics");
        DashboardStatsResponse stats = studentService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * Retrieve a specific student by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<StudentResponse> getStudentById(@PathVariable Long id) {
        log.info("Fetching student with ID: {}", id);
        StudentResponse student = studentService.getStudentById(id);
        return ResponseEntity.ok(student);
    }

    /**
     * Add a new student record.
     */
    @PostMapping
    public ResponseEntity<StudentResponse> createStudent(@Valid @RequestBody StudentRequest request) {
        log.info("Creating student with email: {}", request.getEmail());
        StudentResponse created = studentService.createStudent(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    /**
     * Update an existing student record.
     */
    @PutMapping("/{id}")
    public ResponseEntity<StudentResponse> updateStudent(
            @PathVariable Long id,
            @Valid @RequestBody StudentRequest request) {
        log.info("Updating student with ID: {}", id);
        StudentResponse updated = studentService.updateStudent(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Delete a student record by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        log.info("Deleting student with ID: {}", id);
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }
}
