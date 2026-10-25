package com.college.portal.repository;

import com.college.portal.model.SubjectEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SubjectEnrollmentRepository extends JpaRepository<SubjectEnrollment, Long> {
    List<SubjectEnrollment> findByStudentIdOrderBySubjectSemesterAscSubjectSubjectCodeAsc(Long studentId);
    List<SubjectEnrollment> findByStudentIdAndSubjectSemesterOrderBySubjectSubjectCodeAsc(Long studentId, String semester);
    Optional<SubjectEnrollment> findByStudentIdAndSubjectId(Long studentId, Long subjectId);
    boolean existsByStudentIdAndSubjectId(Long studentId, Long subjectId);

    void deleteByStudentId(Long studentId);
}
