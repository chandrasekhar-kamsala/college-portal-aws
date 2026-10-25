package com.college.portal.service;

import com.college.portal.dto.SubjectResponse;
import com.college.portal.exception.ResourceNotFoundException;
import com.college.portal.model.*;
import com.college.portal.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final SubjectEnrollmentRepository enrollmentRepository;
    private final StudentRepository studentRepository;

    public SubjectServiceImpl(SubjectRepository subjectRepository,
                              SubjectEnrollmentRepository enrollmentRepository,
                              StudentRepository studentRepository) {
        this.subjectRepository = subjectRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponse> getCatalog(Long studentId, String semester) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found."));
        String selectedSemester = normalizeSemester(semester, student);
        List<Long> enrolledIds = enrollmentRepository.findByStudentIdAndSubjectSemesterOrderBySubjectSubjectCodeAsc(studentId, selectedSemester)
                .stream().map(e -> e.getSubject().getId()).collect(Collectors.toList());
        return subjectRepository.findByDepartmentIgnoreCaseAndSemesterOrderBySubjectCodeAsc(student.getDepartment(), selectedSemester)
                .stream().map(subject -> {
                    SubjectResponse response = new SubjectResponse(subject);
                    if (enrolledIds.contains(subject.getId())) {
                        response = new SubjectResponse(enrollmentRepository.findByStudentIdAndSubjectId(studentId, subject.getId()).orElseThrow());
                    }
                    return response;
                }).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubjectResponse> getEnrollments(Long studentId, String semester) {
        List<SubjectEnrollment> enrollments = semester == null || semester.isBlank()
                ? enrollmentRepository.findByStudentIdOrderBySubjectSemesterAscSubjectSubjectCodeAsc(studentId)
                : enrollmentRepository.findByStudentIdAndSubjectSemesterOrderBySubjectSubjectCodeAsc(studentId, semester.trim());
        return enrollments.stream().map(SubjectResponse::new).collect(Collectors.toList());
    }

    @Override
    public SubjectResponse enroll(Long studentId, Long subjectId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found."));
        Subject subject = subjectRepository.findById(subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found."));
        if (!subject.getDepartment().equalsIgnoreCase(student.getDepartment())) {
            throw new IllegalArgumentException("Subject is not offered for this student's department.");
        }
        SubjectEnrollment enrollment = enrollmentRepository.findByStudentIdAndSubjectId(studentId, subjectId)
                .orElseGet(() -> enrollmentRepository.save(new SubjectEnrollment(student, subject)));
        return new SubjectResponse(enrollment);
    }

    @Override
    public void unenroll(Long studentId, Long subjectId) {
        SubjectEnrollment enrollment = enrollmentRepository.findByStudentIdAndSubjectId(studentId, subjectId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found."));
        enrollmentRepository.delete(enrollment);
    }

    private String normalizeSemester(String semester, Student student) {
        if (semester != null && !semester.isBlank()) return semester.trim();
        return student.getSemester() != null && !student.getSemester().isBlank() ? student.getSemester() : "Semester 1";
    }
}
