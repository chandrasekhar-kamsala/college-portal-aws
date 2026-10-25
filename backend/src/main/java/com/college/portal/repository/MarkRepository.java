package com.college.portal.repository;

import com.college.portal.model.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {

    List<Mark> findByStudentIdOrderBySemesterAscSubjectCodeAsc(Long studentId);

    List<Mark> findByStudentIdAndSemesterOrderBySubjectCodeAsc(Long studentId, String semester);

    List<Mark> findBySemesterOrderBySubjectCodeAsc(String semester);

    List<Mark> findAllByOrderByCreatedAtDesc();

    void deleteByStudentId(Long studentId);
}
