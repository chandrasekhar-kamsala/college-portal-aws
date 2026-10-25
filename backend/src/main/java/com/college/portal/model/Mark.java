package com.college.portal.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "marks", indexes = {
        @Index(name = "idx_marks_student", columnList = "student_id"),
        @Index(name = "idx_marks_subject", columnList = "subject_code"),
        @Index(name = "idx_marks_semester", columnList = "semester")
})
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Column(name = "subject_code", nullable = false, length = 30)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false, length = 100)
    private String subjectName;

    @Column(name = "semester", nullable = false, length = 20)
    private String semester;

    @Column(name = "exam_type", nullable = false, length = 50)
    private String examType; // e.g. Mid-Term, End-Semester, Assignment

    @Column(name = "score", nullable = false)
    private Double score;

    @Column(name = "max_score", nullable = false)
    private Double maxScore = 100.0;

    @Column(name = "grade", nullable = false, length = 10)
    private String grade;

    @Column(name = "grade_points", nullable = false)
    private Double gradePoints;

    @Column(name = "credits", nullable = false)
    private Integer credits = 3;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Mark() {
    }

    public Mark(Student student, String subjectCode, String subjectName, String semester,
                String examType, Double score, Double maxScore, Integer credits) {
        this.student = student;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.semester = semester;
        this.examType = examType;
        this.score = score;
        this.maxScore = maxScore != null && maxScore > 0 ? maxScore : 100.0;
        this.credits = credits != null && credits > 0 ? credits : 3;
        computeGradeAndPoints();
    }

    public void computeGradeAndPoints() {
        if (this.maxScore == null || this.maxScore <= 0) {
            this.maxScore = 100.0;
        }
        if (this.score == null) {
            this.score = 0.0;
        }
        double percentage = (this.score / this.maxScore) * 100.0;
        if (percentage >= 90.0) {
            this.grade = "O";
            this.gradePoints = 10.0;
        } else if (percentage >= 80.0) {
            this.grade = "A+";
            this.gradePoints = 9.0;
        } else if (percentage >= 70.0) {
            this.grade = "A";
            this.gradePoints = 8.0;
        } else if (percentage >= 60.0) {
            this.grade = "B+";
            this.gradePoints = 7.0;
        } else if (percentage >= 50.0) {
            this.grade = "B";
            this.gradePoints = 6.0;
        } else if (percentage >= 40.0) {
            this.grade = "C";
            this.gradePoints = 5.0;
        } else {
            this.grade = "F";
            this.gradePoints = 0.0;
        }
    }

    @PrePersist
    protected void onCreate() {
        computeGradeAndPoints();
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        computeGradeAndPoints();
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
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

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
