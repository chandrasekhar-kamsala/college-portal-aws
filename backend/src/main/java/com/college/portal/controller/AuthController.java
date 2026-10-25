package com.college.portal.controller;

import com.college.portal.dto.*;
import com.college.portal.service.AuthService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Admin login endpoint with username/email and BCrypt password verification.
     */
    @PostMapping("/admin/login")
    public ResponseEntity<AuthResponse> adminLogin(@Valid @RequestBody AdminLoginRequest request) {
        log.info("Received admin login request for username: {}", request.getUsername());
        AuthResponse response = authService.adminLogin(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Check student account activation status by register number.
     * Used by Student Login page to switch between first-time activation and standard login.
     */
    @PostMapping("/student/check-status")
    public ResponseEntity<StudentStatusResponse> checkStudentStatus(@Valid @RequestBody StudentCheckStatusRequest request) {
        log.info("Checking student status for register number: {}", request.getRegisterNumber());
        StudentStatusResponse response = authService.checkStudentStatus(request.getRegisterNumber());
        return ResponseEntity.ok(response);
    }

    /**
     * First-time student password setup. Activates the account.
     * Idempotent & protected: fails if already activated.
     */
    @PostMapping("/student/activate")
    public ResponseEntity<AuthResponse> activateStudent(@Valid @RequestBody StudentSetPasswordRequest request) {
        log.info("Processing student activation for register number: {}", request.getRegisterNumber());
        AuthResponse response = authService.activateStudent(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Standard student login with register number and password.
     */
    @PostMapping("/student/login")
    public ResponseEntity<AuthResponse> studentLogin(@Valid @RequestBody StudentLoginRequest request) {
        log.info("Received student login request for register number: {}", request.getRegisterNumber());
        AuthResponse response = authService.studentLogin(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Get profile of currently authenticated user (Admin or Student).
     */
    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getCurrentUser() {
        AuthResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(response);
    }
}
