package com.college.portal.dto;

import com.college.portal.model.Subject;
import com.college.portal.model.SubjectEnrollment;

public class SubjectResponse {

    private Long id;
    private String department;
    private String semester;
    private String subjectCode;
    private String subjectName;
    private Integer credits;
    private boolean enrolled;
    private Long enrollmentId;

    public SubjectResponse(Subject subject) {
        this.id = subject.getId();
        this.department = subject.getDepartment();
        this.semester = subject.getSemester();
        this.subjectCode = subject.getSubjectCode();
        this.subjectName = subject.getSubjectName();
        this.credits = subject.getCredits();
    }

    public SubjectResponse(SubjectEnrollment enrollment) {
        this(enrollment.getSubject());
        this.enrolled = true;
        this.enrollmentId = enrollment.getId();
    }

    public Long getId() { return id; }
    public String getDepartment() { return department; }
    public String getSemester() { return semester; }
    public String getSubjectCode() { return subjectCode; }
    public String getSubjectName() { return subjectName; }
    public Integer getCredits() { return credits; }
    public boolean isEnrolled() { return enrolled; }
    public Long getEnrollmentId() { return enrollmentId; }
}
