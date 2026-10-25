package com.college.portal.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "students", indexes = {
        @Index(name = "idx_student_email", columnList = "email", unique = true),
        @Index(name = "idx_student_register_number", columnList = "register_number", unique = true),
        @Index(name = "idx_student_department", columnList = "department")
})
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "register_number", unique = true, length = 50)
    private String registerNumber;

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 120)
    private String email;

    @Column(name = "department", nullable = false, length = 80)
    private String department;

    @Column(name = "course", length = 80)
    private String course;

    @Column(name = "semester", length = 20)
    private String semester;

    @Column(name = "academic_year", nullable = false, length = 30)
    private String academicYear;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Lob
    @Column(name = "photo_data", columnDefinition = "LONGTEXT")
    private String photoData;

    @Column(name = "activated", nullable = false)
    private Boolean activated = false;

    @JsonIgnore
    @Column(name = "password", length = 255)
    private String password;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Student() {
        this.activated = false;
    }

    // Existing constructor preserved for backward compatibility
    public Student(String fullName, String email, String department, String academicYear, String phoneNumber) {
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.academicYear = academicYear;
        this.phoneNumber = phoneNumber;
        this.activated = false;
    }

    // Full constructor
    public Student(String registerNumber, String fullName, String email, String department, String course, String semester, String academicYear, String phoneNumber) {
        this.registerNumber = registerNumber;
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.course = course;
        this.semester = semester;
        this.academicYear = academicYear;
        this.phoneNumber = phoneNumber;
        this.activated = false;
    }

    @PrePersist
    protected void onCreate() {
        if (this.activated == null) {
            this.activated = false;
        }
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegisterNumber() {
        return registerNumber;
    }

    public void setRegisterNumber(String registerNumber) {
        this.registerNumber = registerNumber;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getCourse() {
        return course;
    }

    public void setCourse(String course) {
        this.course = course;
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

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getPhotoData() {
        return photoData;
    }

    public void setPhotoData(String photoData) {
        this.photoData = photoData;
    }

    public Boolean getActivated() {
        return activated != null && activated;
    }

    public void setActivated(Boolean activated) {
        this.activated = activated;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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
