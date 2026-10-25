package com.college.portal.controller;

import com.college.portal.dto.*;
import com.college.portal.service.AttendanceService;
import com.college.portal.service.HallTicketService;
import com.college.portal.service.MarkService;
import com.college.portal.service.SubjectService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminAcademicController {

    private static final Logger log = LoggerFactory.getLogger(AdminAcademicController.class);

    private final AttendanceService attendanceService;
    private final MarkService markService;
    private final HallTicketService hallTicketService;
    private final SubjectService subjectService;

    public AdminAcademicController(AttendanceService attendanceService,
                                   MarkService markService,
                                   HallTicketService hallTicketService,
                                   SubjectService subjectService) {
        this.attendanceService = attendanceService;
        this.markService = markService;
        this.hallTicketService = hallTicketService;
        this.subjectService = subjectService;
    }

    // ==========================================
    // ENROLLED SUBJECTS
    // ==========================================

    @GetMapping("/subjects/student/{studentId}")
    public ResponseEntity<List<SubjectResponse>> getStudentSubjects(
            @PathVariable Long studentId,
            @RequestParam(required = false) String semester) {
        return ResponseEntity.ok(subjectService.getEnrollments(studentId, semester));
    }

    // ==========================================
    // ATTENDANCE MANAGEMENT
    // ==========================================

    @GetMapping("/attendance")
    public ResponseEntity<List<AttendanceResponse>> getAllAttendance(
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) String subjectCode,
            @RequestParam(required = false) Long studentId) {
        return ResponseEntity.ok(attendanceService.getAllAttendance(semester, subjectCode, studentId));
    }

    @GetMapping("/attendance/student/{studentId}/summary")
    public ResponseEntity<AttendanceSummaryResponse> getAttendanceSummary(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceSummaryForStudent(studentId, null));
    }

    @PostMapping("/attendance")
    public ResponseEntity<AttendanceResponse> recordAttendance(@Valid @RequestBody AttendanceRequest request) {
        log.info("Admin recording attendance for student ID: {}", request.getStudentId());
        AttendanceResponse response = attendanceService.recordAttendance(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/attendance/{id}")
    public ResponseEntity<AttendanceResponse> updateAttendance(
            @PathVariable Long id, @Valid @RequestBody AttendanceRequest request) {
        log.info("Admin updating attendance ID: {}", id);
        return ResponseEntity.ok(attendanceService.updateAttendance(id, request));
    }

    @DeleteMapping("/attendance/{id}")
    public ResponseEntity<Void> deleteAttendance(@PathVariable Long id) {
        log.info("Admin deleting attendance ID: {}", id);
        attendanceService.deleteAttendance(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // MARKS & GRADES MANAGEMENT
    // ==========================================

    @GetMapping("/marks")
    public ResponseEntity<List<MarkResponse>> getAllMarks(
            @RequestParam(required = false) String semester,
            @RequestParam(required = false) Long studentId) {
        return ResponseEntity.ok(markService.getAllMarks(semester, studentId));
    }

    @PostMapping("/marks")
    public ResponseEntity<MarkResponse> recordMark(@Valid @RequestBody MarkRequest request) {
        log.info("Admin recording mark for student ID: {}", request.getStudentId());
        MarkResponse response = markService.recordMark(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/marks/{id}")
    public ResponseEntity<MarkResponse> updateMark(
            @PathVariable Long id, @Valid @RequestBody MarkRequest request) {
        log.info("Admin updating mark ID: {}", id);
        return ResponseEntity.ok(markService.updateMark(id, request));
    }

    @DeleteMapping("/marks/{id}")
    public ResponseEntity<Void> deleteMark(@PathVariable Long id) {
        log.info("Admin deleting mark ID: {}", id);
        markService.deleteMark(id);
        return ResponseEntity.noContent().build();
    }

    // ==========================================
    // HALL TICKET MANAGEMENT
    // ==========================================

    @GetMapping("/hall-tickets")
    public ResponseEntity<List<HallTicketResponse>> getAllHallTickets() {
        return ResponseEntity.ok(hallTicketService.getAllHallTickets());
    }

    @PostMapping("/hall-tickets")
    public ResponseEntity<HallTicketResponse> createHallTicket(@Valid @RequestBody HallTicketRequest request) {
        log.info("Admin creating hall ticket for student ID: {}", request.getStudentId());
        HallTicketResponse response = hallTicketService.createHallTicket(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/hall-tickets/{id}")
    public ResponseEntity<HallTicketResponse> updateHallTicket(
            @PathVariable Long id, @Valid @RequestBody HallTicketRequest request) {
        log.info("Admin updating hall ticket ID: {}", id);
        return ResponseEntity.ok(hallTicketService.updateHallTicket(id, request));
    }

    @PatchMapping("/hall-tickets/{id}/publish")
    public ResponseEntity<HallTicketResponse> togglePublishHallTicket(
            @PathVariable Long id, @RequestParam(required = false) Boolean published) {
        log.info("Admin toggling hall ticket publish status for ID: {}", id);
        return ResponseEntity.ok(hallTicketService.togglePublish(id, published));
    }

    @DeleteMapping("/hall-tickets/{id}")
    public ResponseEntity<Void> deleteHallTicket(@PathVariable Long id) {
        log.info("Admin deleting hall ticket ID: {}", id);
        hallTicketService.deleteHallTicket(id);
        return ResponseEntity.noContent().build();
    }
}
