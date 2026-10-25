package com.college.portal.controller;

import com.college.portal.dto.*;
import com.college.portal.security.SecurityUtils;
import com.college.portal.service.AttendanceService;
import com.college.portal.service.HallTicketService;
import com.college.portal.service.MarkService;
import com.college.portal.service.StudentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/student/me")
public class StudentSelfServiceController {

    private static final Logger log = LoggerFactory.getLogger(StudentSelfServiceController.class);

    private final StudentService studentService;
    private final AttendanceService attendanceService;
    private final MarkService markService;
    private final HallTicketService hallTicketService;

    public StudentSelfServiceController(StudentService studentService,
                                       AttendanceService attendanceService,
                                       MarkService markService,
                                       HallTicketService hallTicketService) {
        this.studentService = studentService;
        this.attendanceService = attendanceService;
        this.markService = markService;
        this.hallTicketService = hallTicketService;
    }

    /**
     * Retrieve the authenticated student's profile.
     * Identity extracted strictly from SecurityContextHolder.
     */
    @GetMapping("/profile")
    public ResponseEntity<StudentResponse> getMyProfile() {
        Long studentId = SecurityUtils.getAuthenticatedStudentId();
        log.info("Student requesting self profile, studentId: {}", studentId);
        StudentResponse student = studentService.getStudentById(studentId);
        return ResponseEntity.ok(student);
    }

    /**
     * Retrieve attendance records and aggregate statistics for the authenticated student.
     */
    @GetMapping("/attendance")
    public ResponseEntity<AttendanceSummaryResponse> getMyAttendance(
            @RequestParam(required = false) String semester) {
        Long studentId = SecurityUtils.getAuthenticatedStudentId();
        log.info("Student requesting attendance, studentId: {}, semester: {}", studentId, semester);
        AttendanceSummaryResponse summary = attendanceService.getAttendanceSummaryForStudent(studentId, semester);
        return ResponseEntity.ok(summary);
    }

    /**
     * Retrieve academic marks for the authenticated student.
     */
    @GetMapping("/marks")
    public ResponseEntity<List<MarkResponse>> getMyMarks(
            @RequestParam(required = false) String semester) {
        Long studentId = SecurityUtils.getAuthenticatedStudentId();
        log.info("Student requesting marks, studentId: {}, semester: {}", studentId, semester);
        List<MarkResponse> marks = markService.getAllMarks(semester, studentId);
        return ResponseEntity.ok(marks);
    }

    /**
     * Retrieve academic grades for the authenticated student.
     */
    @GetMapping("/grades")
    public ResponseEntity<List<MarkResponse>> getMyGrades(
            @RequestParam(required = false) String semester) {
        Long studentId = SecurityUtils.getAuthenticatedStudentId();
        List<MarkResponse> marks = markService.getAllMarks(semester, studentId);
        return ResponseEntity.ok(marks);
    }

    /**
     * Retrieve semester results (GPA, pass/fail status, percentage) for the authenticated student.
     */
    @GetMapping("/results")
    public ResponseEntity<List<SemesterResultResponse>> getMySemesterResults() {
        Long studentId = SecurityUtils.getAuthenticatedStudentId();
        log.info("Student requesting semester results, studentId: {}", studentId);
        List<SemesterResultResponse> results = markService.getAllSemesterResultsForStudent(studentId);
        return ResponseEntity.ok(results);
    }

    /**
     * Retrieve enrolled courses and subjects for the student.
     */
    @GetMapping("/courses")
    public ResponseEntity<List<Map<String, String>>> getMyCourses() {
        Long studentId = SecurityUtils.getAuthenticatedStudentId();
        StudentResponse student = studentService.getStudentById(studentId);

        // Collect unique subjects from marks and attendance
        List<MarkResponse> marks = markService.getAllMarks(null, studentId);
        AttendanceSummaryResponse attendance = attendanceService.getAttendanceSummaryForStudent(studentId, null);

        Map<String, Map<String, String>> coursesMap = new LinkedHashMap<>();

        // Add subjects from marks
        for (MarkResponse m : marks) {
            Map<String, String> c = new HashMap<>();
            c.put("subjectCode", m.getSubjectCode());
            c.put("subjectName", m.getSubjectName());
            c.put("semester", m.getSemester());
            c.put("credits", String.valueOf(m.getCredits()));
            c.put("department", student.getDepartment());
            coursesMap.putIfAbsent(m.getSubjectCode(), c);
        }

        // Add subjects from attendance
        if (attendance.getSubjectSummaries() != null) {
            for (AttendanceSummaryResponse.SubjectAttendanceSummary s : attendance.getSubjectSummaries()) {
                if (!coursesMap.containsKey(s.getSubjectCode())) {
                    Map<String, String> c = new HashMap<>();
                    c.put("subjectCode", s.getSubjectCode());
                    c.put("subjectName", s.getSubjectName());
                    c.put("semester", student.getSemester() != null ? student.getSemester() : "Current Semester");
                    c.put("credits", "3");
                    c.put("department", student.getDepartment());
                    coursesMap.put(s.getSubjectCode(), c);
                }
            }
        }

        // If no marks/attendance yet, create default department subjects based on student course
        if (coursesMap.isEmpty()) {
            Map<String, String> c1 = new HashMap<>();
            c1.put("subjectCode", "CORE-101");
            c1.put("subjectName", student.getCourse() != null ? student.getCourse() + " Foundation" : "Foundation Studies");
            c1.put("semester", student.getSemester() != null ? student.getSemester() : "Semester 1");
            c1.put("credits", "4");
            c1.put("department", student.getDepartment());
            coursesMap.put("CORE-101", c1);
        }

        return ResponseEntity.ok(new ArrayList<>(coursesMap.values()));
    }

    /**
     * Retrieve only published hall tickets for the authenticated student.
     */
    @GetMapping("/hall-tickets")
    public ResponseEntity<List<HallTicketResponse>> getMyHallTickets() {
        Long studentId = SecurityUtils.getAuthenticatedStudentId();
        log.info("Student requesting hall tickets, studentId: {}", studentId);
        List<HallTicketResponse> tickets = hallTicketService.getPublishedHallTicketsForStudent(studentId);
        return ResponseEntity.ok(tickets);
    }
}
