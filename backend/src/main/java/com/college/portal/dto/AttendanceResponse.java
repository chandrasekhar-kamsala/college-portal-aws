package com.college.portal.dto;

import com.college.portal.model.Attendance;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class AttendanceResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private String subjectCode;
    private String subjectName;
    private String semester;
    private LocalDate attendanceDate;
    private String sessionName;
    private String status;
    private String remarks;
    private LocalDateTime createdAt;

    public AttendanceResponse() {
    }

    public AttendanceResponse(Attendance attendance) {
        this.id = attendance.getId();
        if (attendance.getStudent() != null) {
            this.studentId = attendance.getStudent().getId();
            this.studentName = attendance.getStudent().getFullName();
            this.registerNumber = attendance.getStudent().getRegisterNumber();
        }
        this.subjectCode = attendance.getSubjectCode();
        this.subjectName = attendance.getSubjectName();
        this.semester = attendance.getSemester();
        this.attendanceDate = attendance.getAttendanceDate();
        this.sessionName = attendance.getSessionName();
        this.status = attendance.getStatus();
        this.remarks = attendance.getRemarks();
        this.createdAt = attendance.getCreatedAt();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getSubjectCode() {
        return subjectCode;
    }

    public void setSubjectCode(String subjectCode) {
        this.subjectCode = subjectCode;
    }

    public String getSubjectName() {
        return subjectName;
    }

    public void setSubjectName(String subjectName) {
        this.subjectName = subjectName;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public String getSessionName() {
        return sessionName;
    }

    public void setSessionName(String sessionName) {
        this.sessionName = sessionName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
