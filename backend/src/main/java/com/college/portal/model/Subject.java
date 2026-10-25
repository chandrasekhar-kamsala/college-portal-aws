package com.college.portal.model;

import jakarta.persistence.*;

@Entity
@Table(name = "subjects", uniqueConstraints = {
        @UniqueConstraint(name = "uk_subject_department_semester_code",
                columnNames = {"department", "semester", "subject_code"})
})
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String department;

    @Column(nullable = false, length = 20)
    private String semester;

    @Column(name = "subject_code", nullable = false, length = 30)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false, length = 120)
    private String subjectName;

    @Column(nullable = false)
    private Integer credits = 3;

    protected Subject() {
    }

    public Subject(String department, String semester, String subjectCode, String subjectName, Integer credits) {
        this.department = department;
        this.semester = semester;
        this.subjectCode = subjectCode;
        this.subjectName = subjectName;
        this.credits = credits != null && credits > 0 ? credits : 3;
    }

    public Long getId() { return id; }
    public String getDepartment() { return department; }
    public String getSemester() { return semester; }
    public String getSubjectCode() { return subjectCode; }
    public String getSubjectName() { return subjectName; }
    public Integer getCredits() { return credits; }
}
