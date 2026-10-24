package com.college.portal.dto;

public class DepartmentCount {

    private String department;
    private Long count;

    public DepartmentCount() {
    }

    public DepartmentCount(String department, Long count) {
        this.department = department;
        this.count = count;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public Long getCount() {
        return count;
    }

    public void setCount(Long count) {
        this.count = count;
    }
}
