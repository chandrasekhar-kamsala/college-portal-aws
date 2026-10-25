package com.college.portal.dto;

public class StudentStatusResponse {

    private String registerNumber;
    private String fullName;
    private String department;
    private String course;
    private Boolean activated;

    public StudentStatusResponse() {
    }

    public StudentStatusResponse(String registerNumber, String fullName, String department, String course, Boolean activated) {
        this.registerNumber = registerNumber;
        this.fullName = fullName;
        this.department = department;
        this.course = course;
        this.activated = activated;
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

    public Boolean getActivated() {
        return activated;
    }

    public void setActivated(Boolean activated) {
        this.activated = activated;
    }
}
