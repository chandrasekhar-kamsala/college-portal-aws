package com.college.portal.service;

import com.college.portal.dto.DashboardStatsResponse;
import com.college.portal.dto.DepartmentCount;
import com.college.portal.dto.StudentRequest;
import com.college.portal.dto.StudentResponse;
import com.college.portal.exception.EmailAlreadyExistsException;
import com.college.portal.exception.ResourceNotFoundException;
import com.college.portal.model.Student;
import com.college.portal.repository.StudentRepository;
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

    public StudentServiceImpl(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
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

        if (studentRepository.existsByEmail(normalizedEmail)) {
            throw new EmailAlreadyExistsException("A student with email '" + normalizedEmail + "' already exists.");
        }

        Student student = new Student();
        student.setFullName(request.getFullName().trim());
        student.setEmail(normalizedEmail);
        student.setDepartment(request.getDepartment().trim());
        student.setAcademicYear(request.getAcademicYear().trim());
        student.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);

        Student savedStudent = studentRepository.save(student);
        log.info("Created new student record with ID: {}, Name: {}", savedStudent.getId(), savedStudent.getFullName());

        return new StudentResponse(savedStudent);
    }

    @Override
    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot update. Student not found with ID: " + id));

        String normalizedEmail = request.getEmail().trim().toLowerCase();

        if (studentRepository.existsByEmailAndIdNot(normalizedEmail, id)) {
            throw new EmailAlreadyExistsException("Another student with email '" + normalizedEmail + "' already exists.");
        }

        student.setFullName(request.getFullName().trim());
        student.setEmail(normalizedEmail);
        student.setDepartment(request.getDepartment().trim());
        student.setAcademicYear(request.getAcademicYear().trim());
        student.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : null);

        Student updatedStudent = studentRepository.save(student);
        log.info("Updated student record with ID: {}", updatedStudent.getId());

        return new StudentResponse(updatedStudent);
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cannot delete. Student not found with ID: " + id));

        studentRepository.delete(student);
        log.info("Deleted student record with ID: {}, Name: {}", student.getId(), student.getFullName());
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalStudents = studentRepository.count();
        List<DepartmentCount> departmentCounts = studentRepository.countStudentsByDepartment();
        List<StudentResponse> recentStudents = studentRepository.findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(StudentResponse::new)
                .collect(Collectors.toList());

        return new DashboardStatsResponse(totalStudents, departmentCounts, recentStudents);
    }
}
