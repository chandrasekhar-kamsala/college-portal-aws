package com.college.portal.service;

import com.college.portal.dto.AttendanceRequest;
import com.college.portal.dto.AttendanceResponse;
import com.college.portal.dto.AttendanceSummaryResponse;
import com.college.portal.dto.AttendanceSummaryResponse.SubjectAttendanceSummary;
import com.college.portal.exception.ResourceNotFoundException;
import com.college.portal.model.Attendance;
import com.college.portal.model.Student;
import com.college.portal.repository.AttendanceRepository;
import com.college.portal.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    private static final Logger log = LoggerFactory.getLogger(AttendanceServiceImpl.class);

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceServiceImpl(AttendanceRepository attendanceRepository, StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public AttendanceResponse recordAttendance(AttendanceRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        String subjectCode = request.getSubjectCode().trim().toUpperCase();
        String sessionName = request.getSessionName().trim();
        String status = request.getStatus().trim().toUpperCase();

        if (!List.of("PRESENT", "ABSENT", "LATE").contains(status)) {
            throw new IllegalArgumentException("Attendance status must be PRESENT, ABSENT, or LATE");
        }

        if (attendanceRepository.existsByStudentIdAndSubjectCodeAndAttendanceDateAndSessionName(
                student.getId(), subjectCode, request.getAttendanceDate(), sessionName)) {
            throw new IllegalArgumentException("Attendance entry already exists for student " +
                    student.getFullName() + ", subject " + subjectCode + ", date " + request.getAttendanceDate() + ", session " + sessionName);
        }

        Attendance attendance = new Attendance(
                student,
                subjectCode,
                request.getSubjectName().trim(),
                request.getSemester().trim(),
                request.getAttendanceDate(),
                sessionName,
                status,
                request.getRemarks() != null ? request.getRemarks().trim() : null
        );

        Attendance saved = attendanceRepository.save(attendance);
        log.info("Recorded attendance ID: {} for student: {}, status: {}", saved.getId(), student.getRegisterNumber(), status);
        return new AttendanceResponse(saved);
    }

    @Override
    public AttendanceResponse updateAttendance(Long id, AttendanceRequest request) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with ID: " + id));

        String subjectCode = request.getSubjectCode().trim().toUpperCase();
        String sessionName = request.getSessionName().trim();
        String status = request.getStatus().trim().toUpperCase();

        if (!List.of("PRESENT", "ABSENT", "LATE").contains(status)) {
            throw new IllegalArgumentException("Attendance status must be PRESENT, ABSENT, or LATE");
        }

        if (attendanceRepository.existsByStudentIdAndSubjectCodeAndAttendanceDateAndSessionNameAndIdNot(
                attendance.getStudent().getId(), subjectCode, request.getAttendanceDate(), sessionName, id)) {
            throw new IllegalArgumentException("Another attendance record already exists for this subject, date, and session.");
        }

        attendance.setSubjectCode(subjectCode);
        attendance.setSubjectName(request.getSubjectName().trim());
        attendance.setSemester(request.getSemester().trim());
        attendance.setAttendanceDate(request.getAttendanceDate());
        attendance.setSessionName(sessionName);
        attendance.setStatus(status);
        attendance.setRemarks(request.getRemarks() != null ? request.getRemarks().trim() : null);

        Attendance updated = attendanceRepository.save(attendance);
        return new AttendanceResponse(updated);
    }

    @Override
    public void deleteAttendance(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with ID: " + id));
        attendanceRepository.delete(attendance);
        log.info("Deleted attendance record ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceResponse getAttendanceById(Long id) {
        Attendance attendance = attendanceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with ID: " + id));
        return new AttendanceResponse(attendance);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceResponse> getAllAttendance(String semester, String subjectCode, Long studentId) {
        List<Attendance> list;
        if (studentId != null) {
            list = attendanceRepository.findByStudentIdOrderByAttendanceDateDesc(studentId);
        } else if (semester != null && !semester.trim().isEmpty() && !"ALL".equalsIgnoreCase(semester.trim())) {
            list = attendanceRepository.findBySemesterOrderByAttendanceDateDesc(semester.trim());
        } else if (subjectCode != null && !subjectCode.trim().isEmpty() && !"ALL".equalsIgnoreCase(subjectCode.trim())) {
            list = attendanceRepository.findBySubjectCodeOrderByAttendanceDateDesc(subjectCode.trim().toUpperCase());
        } else {
            list = attendanceRepository.findAllByOrderByAttendanceDateDesc();
        }

        return list.stream().map(AttendanceResponse::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceSummaryResponse getAttendanceSummaryForStudent(Long studentId, String semester) {
        List<Attendance> records = (semester != null && !semester.trim().isEmpty() && !"ALL".equalsIgnoreCase(semester.trim()))
                ? attendanceRepository.findByStudentIdAndSemesterOrderByAttendanceDateDesc(studentId, semester.trim())
                : attendanceRepository.findByStudentIdOrderByAttendanceDateDesc(studentId);

        long totalSessions = records.size();
        long presentSessions = records.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
        long absentSessions = records.stream().filter(a -> "ABSENT".equalsIgnoreCase(a.getStatus())).count();
        long lateSessions = records.stream().filter(a -> "LATE".equalsIgnoreCase(a.getStatus())).count();

        // Late can count as present (or partial), but standard policy is: Present count / Total
        double overallPercentage = totalSessions > 0
                ? Math.round(((double) presentSessions / totalSessions) * 1000.0) / 10.0
                : 0.0;

        // Group by subject
        Map<String, List<Attendance>> bySubject = records.stream()
                .collect(Collectors.groupingBy(Attendance::getSubjectCode));

        List<SubjectAttendanceSummary> subjectSummaries = new ArrayList<>();
        for (Map.Entry<String, List<Attendance>> entry : bySubject.entrySet()) {
            List<Attendance> subRecords = entry.getValue();
            String subCode = entry.getKey();
            String subName = subRecords.get(0).getSubjectName();
            long subTotal = subRecords.size();
            long subPresent = subRecords.stream().filter(a -> "PRESENT".equalsIgnoreCase(a.getStatus())).count();
            double subPercent = subTotal > 0
                    ? Math.round(((double) subPresent / subTotal) * 1000.0) / 10.0
                    : 0.0;

            subjectSummaries.add(new SubjectAttendanceSummary(subCode, subName, subTotal, subPresent, subPercent));
        }

        subjectSummaries.sort(Comparator.comparing(SubjectAttendanceSummary::getSubjectCode));

        List<AttendanceResponse> responseList = records.stream()
                .map(AttendanceResponse::new)
                .collect(Collectors.toList());

        return new AttendanceSummaryResponse(
                totalSessions,
                presentSessions,
                absentSessions,
                lateSessions,
                overallPercentage,
                responseList,
                subjectSummaries
        );
    }
}
