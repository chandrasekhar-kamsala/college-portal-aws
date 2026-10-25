package com.college.portal.repository;

import com.college.portal.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByDepartmentIgnoreCaseAndSemesterOrderBySubjectCodeAsc(String department, String semester);
    boolean existsByDepartmentIgnoreCaseAndSemesterAndSubjectCode(String department, String semester, String subjectCode);
}
