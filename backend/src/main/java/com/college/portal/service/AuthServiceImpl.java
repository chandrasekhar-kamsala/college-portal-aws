package com.college.portal.service;

import com.college.portal.dto.*;
import com.college.portal.exception.ResourceNotFoundException;
import com.college.portal.model.Admin;
import com.college.portal.model.Student;
import com.college.portal.repository.AdminRepository;
import com.college.portal.repository.StudentRepository;
import com.college.portal.security.JwtService;
import com.college.portal.security.SecurityUtils;
import com.college.portal.security.UserPrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    private final AdminRepository adminRepository;
    private final StudentRepository studentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(AdminRepository adminRepository,
                           StudentRepository studentRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.adminRepository = adminRepository;
        this.studentRepository = studentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse adminLogin(AdminLoginRequest request) {
        String identifier = request.getUsername().trim();

        Admin admin = adminRepository.findByUsername(identifier)
                .or(() -> adminRepository.findByEmail(identifier))
                .orElseThrow(() -> new BadCredentialsException("Invalid admin username or password"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            log.warn("Failed admin login attempt for identifier: {}", identifier);
            throw new BadCredentialsException("Invalid admin username or password");
        }

        log.info("Admin login successful for username: {}", admin.getUsername());
        String token = jwtService.generateAdminToken(admin.getId(), admin.getUsername(), admin.getEmail());

        return new AuthResponse(
                token,
                "ADMIN",
                admin.getUsername(),
                admin.getEmail(),
                "System Administrator",
                null,
                null,
                "Admin authenticated successfully"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public StudentStatusResponse checkStudentStatus(String registerNumber) {
        if (registerNumber == null || registerNumber.trim().isEmpty()) {
            throw new IllegalArgumentException("Register number is required");
        }

        String normalizedRegNo = registerNumber.trim().toUpperCase();
        Student student = studentRepository.findByRegisterNumber(normalizedRegNo)
                .orElseThrow(() -> new ResourceNotFoundException("No student found with register number: " + normalizedRegNo));

        return new StudentStatusResponse(
                student.getRegisterNumber(),
                student.getFullName(),
                student.getDepartment(),
                student.getCourse(),
                student.getActivated()
        );
    }

    @Override
    public AuthResponse activateStudent(StudentSetPasswordRequest request) {
        String normalizedRegNo = request.getRegisterNumber().trim().toUpperCase();

        Student student = studentRepository.findByRegisterNumber(normalizedRegNo)
                .orElseThrow(() -> new ResourceNotFoundException("No student found with register number: " + normalizedRegNo));

        if (student.getActivated()) {
            log.warn("Blocked attempt to re-activate student with register number: {}", normalizedRegNo);
            throw new IllegalStateException("Account is already activated. Please log in using your register number and password.");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match.");
        }

        if (request.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters long.");
        }

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        student.setPassword(hashedPassword);
        student.setActivated(true);

        Student savedStudent = studentRepository.save(student);
        log.info("Student account activated successfully for RegNo: {}, Name: {}",
                savedStudent.getRegisterNumber(), savedStudent.getFullName());

        String token = jwtService.generateStudentToken(
                savedStudent.getId(),
                savedStudent.getRegisterNumber(),
                savedStudent.getFullName(),
                savedStudent.getEmail()
        );

        return new AuthResponse(
                token,
                "STUDENT",
                savedStudent.getRegisterNumber(),
                savedStudent.getEmail(),
                savedStudent.getFullName(),
                savedStudent.getId(),
                savedStudent.getRegisterNumber(),
                "Your account has been activated successfully! Welcome to College Portal."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse studentLogin(StudentLoginRequest request) {
        String normalizedRegNo = request.getRegisterNumber().trim().toUpperCase();

        Student student = studentRepository.findByRegisterNumber(normalizedRegNo)
                .orElseThrow(() -> new BadCredentialsException("Invalid register number or password"));

        if (!student.getActivated()) {
            log.warn("Student {} attempted login prior to activation", normalizedRegNo);
            throw new IllegalStateException("Account has not completed activation. Please perform first-time password setup.");
        }

        if (student.getPassword() == null || !passwordEncoder.matches(request.getPassword(), student.getPassword())) {
            log.warn("Failed student login attempt for RegNo: {}", normalizedRegNo);
            throw new BadCredentialsException("Invalid register number or password");
        }

        log.info("Student login successful for RegNo: {}", student.getRegisterNumber());
        String token = jwtService.generateStudentToken(
                student.getId(),
                student.getRegisterNumber(),
                student.getFullName(),
                student.getEmail()
        );

        return new AuthResponse(
                token,
                "STUDENT",
                student.getRegisterNumber(),
                student.getEmail(),
                student.getFullName(),
                student.getId(),
                student.getRegisterNumber(),
                "Student authenticated successfully"
        );
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser() {
        UserPrincipal principal = SecurityUtils.getCurrentUser();
        if (principal == null) {
            throw new BadCredentialsException("Not authenticated");
        }

        String role = principal.getRole().replace("ROLE_", "");
        return new AuthResponse(
                null,
                role,
                principal.getUsername(),
                principal.getEmail(),
                principal.getFullName(),
                "STUDENT".equals(role) ? principal.getId() : null,
                "STUDENT".equals(role) ? principal.getUsername() : null,
                "Current user details"
        );
    }
}
