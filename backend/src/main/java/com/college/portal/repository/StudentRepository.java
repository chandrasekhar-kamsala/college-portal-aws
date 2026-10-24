package com.college.portal.repository;

import com.college.portal.dto.DepartmentCount;
import com.college.portal.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByEmailAndIdNot(String email, Long id);

    List<Student> findByDepartmentIgnoreCase(String department);

    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(s.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Student> searchStudents(@Param("keyword") String keyword);

    @Query("SELECT s FROM Student s WHERE " +
           "(:department IS NULL OR LOWER(s.department) = LOWER(:department)) AND " +
           "(:search IS NULL OR LOWER(s.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY s.id DESC")
    List<Student> filterAndSearchStudents(@Param("department") String department, @Param("search") String search);

    List<Student> findTop5ByOrderByCreatedAtDesc();

    @Query("SELECT new com.college.portal.dto.DepartmentCount(s.department, COUNT(s)) " +
           "FROM Student s GROUP BY s.department ORDER BY COUNT(s) DESC")
    List<DepartmentCount> countStudentsByDepartment();
}
