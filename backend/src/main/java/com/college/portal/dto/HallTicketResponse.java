package com.college.portal.dto;

import com.college.portal.model.HallTicket;
import java.time.LocalDateTime;

public class HallTicketResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private String course;
    private String department;
    private String hallTicketNumber;
    private String examName;
    private String semester;
    private String academicYear;
    private String examCenter;
    private String examDate;
    private String instructions;
    private Boolean published;
    private LocalDateTime createdAt;

    public HallTicketResponse() {
    }

    public HallTicketResponse(HallTicket ticket) {
        this.id = ticket.getId();
        if (ticket.getStudent() != null) {
            this.studentId = ticket.getStudent().getId();
            this.studentName = ticket.getStudent().getFullName();
            this.registerNumber = ticket.getStudent().getRegisterNumber();
            this.course = ticket.getStudent().getCourse();
            this.department = ticket.getStudent().getDepartment();
        }
        this.hallTicketNumber = ticket.getHallTicketNumber();
        this.examName = ticket.getExamName();
        this.semester = ticket.getSemester();
        this.academicYear = ticket.getAcademicYear();
        this.examCenter = ticket.getExamCenter();
        this.examDate = ticket.getExamDate();
        this.instructions = ticket.getInstructions();
        this.published = ticket.getPublished();
        this.createdAt = ticket.getCreatedAt();
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

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getHallTicketNumber() {
        return hallTicketNumber;
    }

    public void setHallTicketNumber(String hallTicketNumber) {
        this.hallTicketNumber = hallTicketNumber;
    }

    public String getExamName() {
        return examName;
    }

    public void setExamName(String examName) {
        this.examName = examName;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public String getExamCenter() {
        return examCenter;
    }

    public void setExamCenter(String examCenter) {
        this.examCenter = examCenter;
    }

    public String getExamDate() {
        return examDate;
    }

    public void setExamDate(String examDate) {
        this.examDate = examDate;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public Boolean getPublished() {
        return published;
    }

    public void setPublished(Boolean published) {
        this.published = published;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
