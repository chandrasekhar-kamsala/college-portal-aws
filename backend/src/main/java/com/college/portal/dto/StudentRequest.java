package com.college.portal.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class StudentRequest {

    @NotBlank(message = "College register number is required")
    @Size(min = 3, max = 50, message = "Register number must be between 3 and 50 characters")
    private String registerNumber;

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email address is required")
    @Email(message = "Please provide a valid email address")
    @Size(max = 120, message = "Email cannot exceed 120 characters")
    private String email;

    @NotBlank(message = "Department is required")
    @Size(min = 2, max = 80, message = "Department must be between 2 and 80 characters")
    private String department;

    @Size(max = 80, message = "Course cannot exceed 80 characters")
    private String course;

    @Size(max = 20, message = "Semester cannot exceed 20 characters")
    private String semester;

    @NotBlank(message = "Academic year is required")
    @Size(min = 2, max = 30, message = "Academic year must be between 2 and 30 characters")
    private String academicYear;

    @Pattern(regexp = "^$|^[+0-9\\s\\-().]{7,25}$", message = "Phone number must be a valid phone format or empty")
    private String phoneNumber;

    @Size(max = 4000000, message = "Photo must be smaller than 3 MB")
    private String photoData;

    public StudentRequest() {
    }

    // Existing constructor preserved for test compatibility
    public StudentRequest(String fullName, String email, String department, String academicYear, String phoneNumber) {
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.academicYear = academicYear;
        this.phoneNumber = phoneNumber;
        this.registerNumber = "REG-" + System.currentTimeMillis();
        this.course = "General Degree";
        this.semester = "Semester 1";
    }

    public StudentRequest(String registerNumber, String fullName, String email, String department, String course, String semester, String academicYear, String phoneNumber) {
        this.registerNumber = registerNumber;
        this.fullName = fullName;
        this.email = email;
        this.department = department;
        this.course = course;
        this.semester = semester;
        this.academicYear = academicYear;
        this.phoneNumber = phoneNumber;
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
}
