package com.college.portal.dto;

import com.college.portal.model.Mark;
import java.time.LocalDateTime;

public class MarkResponse {

    private Long id;
    private Long studentId;
    private String studentName;
    private String registerNumber;
    private String subjectCode;
    private String subjectName;
    private String semester;
    private String examType;
    private Double score;
    private Double maxScore;
    private Double percentage;
    private String grade;
    private Double gradePoints;
    private Integer credits;
    private LocalDateTime createdAt;

    public MarkResponse() {
    }

    public MarkResponse(Mark mark) {
        this.id = mark.getId();
        if (mark.getStudent() != null) {
            this.studentId = mark.getStudent().getId();
            this.studentName = mark.getStudent().getFullName();
            this.registerNumber = mark.getStudent().getRegisterNumber();
        }
        this.subjectCode = mark.getSubjectCode();
        this.subjectName = mark.getSubjectName();
        this.semester = mark.getSemester();
        this.examType = mark.getExamType();
        this.score = mark.getScore();
        this.maxScore = mark.getMaxScore();
        this.percentage = (mark.getMaxScore() != null && mark.getMaxScore() > 0)
                ? Math.round((mark.getScore() / mark.getMaxScore()) * 1000.0) / 10.0
                : 0.0;
        this.grade = mark.getGrade();
        this.gradePoints = mark.getGradePoints();
        this.credits = mark.getCredits();
        this.createdAt = mark.getCreatedAt();
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

    public String getExamType() {
        return examType;
    }

    public void setExamType(String examType) {
        this.examType = examType;
    }

    public Double getScore() {
        return score;
    }

    public void setScore(Double score) {
        this.score = score;
    }

    public Double getMaxScore() {
        return maxScore;
    }

    public void setMaxScore(Double maxScore) {
        this.maxScore = maxScore;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public String getGrade() {
        return grade;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public Double getGradePoints() {
        return gradePoints;
    }

    public void setGradePoints(Double gradePoints) {
        this.gradePoints = gradePoints;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
