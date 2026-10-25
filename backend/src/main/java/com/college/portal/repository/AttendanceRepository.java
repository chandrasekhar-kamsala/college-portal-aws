package com.college.portal.repository;

import com.college.portal.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    List<Attendance> findByStudentIdOrderByAttendanceDateDesc(Long studentId);

    List<Attendance> findByStudentIdAndSemesterOrderByAttendanceDateDesc(Long studentId, String semester);

    boolean existsByStudentIdAndSubjectCodeAndAttendanceDateAndSessionName(
            Long studentId, String subjectCode, LocalDate attendanceDate, String sessionName);

    boolean existsByStudentIdAndSubjectCodeAndAttendanceDateAndSessionNameAndIdNot(
            Long studentId, String subjectCode, LocalDate attendanceDate, String sessionName, Long id);

    List<Attendance> findBySemesterOrderByAttendanceDateDesc(String semester);

    List<Attendance> findBySubjectCodeOrderByAttendanceDateDesc(String subjectCode);

    long countByStudentId(Long studentId);

    long countByStudentIdAndStatus(Long studentId, String status);

    void deleteByStudentId(Long studentId);

    List<Attendance> findAllByOrderByAttendanceDateDesc();
}
