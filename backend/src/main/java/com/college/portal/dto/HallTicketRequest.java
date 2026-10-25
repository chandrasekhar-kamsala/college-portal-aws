package com.college.portal.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class HallTicketRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotBlank(message = "Hall ticket number is required")
    private String hallTicketNumber;

    @NotBlank(message = "Examination name is required")
    private String examName;

    @NotBlank(message = "Semester is required")
    private String semester;

    @NotBlank(message = "Academic year is required")
    private String academicYear;

    @NotBlank(message = "Examination center is required")
    private String examCenter;

    @NotBlank(message = "Examination date is required")
    private String examDate;

    private String instructions;

    private Boolean published = false;

    public HallTicketRequest() {
    }

    public HallTicketRequest(Long studentId, String hallTicketNumber, String examName, String semester,
                             String academicYear, String examCenter, String examDate, String instructions, Boolean published) {
        this.studentId = studentId;
        this.hallTicketNumber = hallTicketNumber;
        this.examName = examName;
        this.semester = semester;
        this.academicYear = academicYear;
        this.examCenter = examCenter;
        this.examDate = examDate;
        this.instructions = instructions;
        this.published = published != null ? published : false;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
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
}
