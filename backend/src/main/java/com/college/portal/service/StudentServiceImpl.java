package com.college.portal.service;

import com.college.portal.dto.DashboardStatsResponse;
import com.college.portal.dto.DepartmentCount;
import com.college.portal.dto.StudentRequest;
import com.college.portal.dto.StudentResponse;
import com.college.portal.exception.DuplicateRegisterNumberException;
import com.college.portal.exception.EmailAlreadyExistsException;
import com.college.portal.exception.ResourceNotFoundException;
import com.college.portal.model.Student;
import com.college.portal.repository.StudentRepository;
import com.college.portal.repository.AttendanceRepository;
import com.college.portal.repository.HallTicketRepository;
import com.college.portal.repository.MarkRepository;
import com.college.portal.repository.SubjectEnrollmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentServiceImpl implements StudentService {

    private static final Logger log = LoggerFactory.getLogger(StudentServiceImpl.class);

    private final StudentRepository studentRepository;
    private final AttendanceRepository attendanceRepository;
    private final MarkRepository markRepository;
    private final HallTicketRepository hallTicketRepository;
    private final SubjectEnrollmentRepository subjectEnrollmentRepository;

    public StudentServiceImpl(StudentRepository studentRepository,
                              AttendanceRepository attendanceRepository,
                              MarkRepository markRepository,
                              HallTicketRepository hallTicketRepository,
                              SubjectEnrollmentRepository subjectEnrollmentRepository) {
        this.studentRepository = studentRepository;
        this.attendanceRepository = attendanceRepository;
        this.markRepository = markRepository;
        this.hallTicketRepository = hallTicketRepository;
        this.subjectEnrollmentRepository = subjectEnrollmentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentResponse> getAllStudents(String department, String search) {
        String deptFilter = (department != null && !department.trim().isEmpty() && !"ALL".equalsIgnoreCase(department.trim()))
                ? department.trim()
                : null;

        String searchFilter = (search != null && !search.trim().isEmpty())
                ? search.trim()
                : null;

        List<Student> students = studentRepository.filterAndSearchStudents(deptFilter, searchFilter);
        return students.stream()
                .map(StudentResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + id));
        return new StudentResponse(student);
    }

    @Override
    public StudentResponse createStudent(StudentRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String normalizedRegNo = request.getRegisterNumber() != null ? request.getRegisterNumber().trim().toUpperCase() : null;

        if (normalizedRegNo == null || normalizedRegNo.isEmpty()) {
            throw new IllegalArgumentException("Register number is required.");
        }

        if (studentRepository.existsByRegisterNumber(normalizedRegNo)) {
            throw new DuplicateRegisterNumberException("A student with register number '" + normalizedRegNo + "' already exists.");
        }

        if (studentRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException("A student with email '" + normalizedEmail + "' already exists.");
        }

        Student student = new Student();
        student.setRegisterNumber(normalizedRegNo);
        student.setFullName(request.getFullName().trim());
        student.setEmail(normalizedEmail);
        student.setDepartment(request.getDepartment().trim());
        student.setCourse(request.getCourse() != null && !request.getCourse().trim().isEmpty() ? request.getCourse().trim() : request.getDepartment().trim());
        student.setSemester(request.getSemester() != null && !request.getSemester().trim().isEmpty() ? request.getSemester().trim() : "Semester 1");
        student.setAcademicYear(request.getAcademicYear().trim());
        student.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);
        student.setPhotoData(normalizePhotoData(request.getPhotoData()));
        student.setActivated(false);
        student.setPassword(null);

        Student savedStudent = studentRepository.save(student);
        log.info("Created new inactive student record with ID: {}, RegNo: {}, Name: {}",
                savedStudent.getId(), savedStudent.getRegisterNumber(), savedStudent.getFullName());

        return new StudentResponse(savedStudent);
    }

    @Override
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot update. Student not found with ID: " + id));

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String normalizedRegNo = request.getRegisterNumber() != null ? request.getRegisterNumber().trim().toUpperCase() : null;

        if (normalizedRegNo != null && !normalizedRegNo.isEmpty() &&
                studentRepository.existsByRegisterNumberAndIdNot(normalizedRegNo, id)) {
            throw new DuplicateRegisterNumberException("Another student with register number '" + normalizedRegNo + "' already exists.");
        }

        if (studentRepository.existsByEmailAndIdNot(normalizedEmail, id)) {
            throw new EmailAlreadyExistsException("Another student with email '" + normalizedEmail + "' already exists.");
        }

        if (normalizedRegNo != null && !normalizedRegNo.isEmpty()) {
            student.setRegisterNumber(normalizedRegNo);
        }
        student.setFullName(request.getFullName().trim());
        student.setEmail(normalizedEmail);
        student.setDepartment(request.getDepartment().trim());
        if (request.getCourse() != null && !request.getCourse().trim().isEmpty()) {
            student.setCourse(request.getCourse().trim());
        }
        if (request.getSemester() != null && !request.getSemester().trim().isEmpty()) {
            student.setSemester(request.getSemester().trim());
        }
        student.setAcademicYear(request.getAcademicYear().trim());
        student.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);
        if (request.getPhotoData() != null && !request.getPhotoData().trim().isEmpty()) {
            student.setPhotoData(normalizePhotoData(request.getPhotoData()));
        }

        Student updatedStudent = studentRepository.save(student);
        log.info("Updated student record with ID: {}", updatedStudent.getId());

        return new StudentResponse(updatedStudent);
    }

    private String normalizePhotoData(String photoData) {
        if (photoData == null || photoData.trim().isEmpty()) {
            return null;
        }
        String normalized = photoData.trim();
        if (!normalized.matches("^data:image/(jpeg|png|webp);base64,[A-Za-z0-9+/=\\r\\n]+$")) {
            throw new IllegalArgumentException("Photo must be a valid JPG, PNG, or WEBP image.");
        }
        return normalized;
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot delete. Student not found with ID: " + id));

        if (subjectEnrollmentRepository != null) {
            subjectEnrollmentRepository.deleteByStudentId(id);
        }
        if (attendanceRepository != null) {
            attendanceRepository.deleteByStudentId(id);
        }
        if (markRepository != null) {
            markRepository.deleteByStudentId(id);
        }
        if (hallTicketRepository != null) {
            hallTicketRepository.deleteByStudentId(id);
        }
        studentRepository.delete(student);
        log.info("Deleted student record with ID: {}, Name: {}", student.getId(), student.getFullName());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalStudents = studentRepository.count();
        long totalActivated = studentRepository.countByActivatedTrue();
        long totalInactive = studentRepository.countByActivatedFalse();

        List<DepartmentCount> departmentCounts = studentRepository.countStudentsByDepartment();
        List<StudentResponse> recentStudents = studentRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(StudentResponse::new)
                .collect(Collectors.toList());

        return new DashboardStatsResponse(totalStudents, totalActivated, totalInactive, departmentCounts, recentStudents);
    }
}
