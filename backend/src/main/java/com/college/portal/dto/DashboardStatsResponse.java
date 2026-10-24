package com.college.portal.dto;

import java.util.List;

public class DashboardStatsResponse {

    private long totalStudents;
    private List<DepartmentCount> departmentCounts;
    private List<StudentResponse> recentStudents;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalStudents, List<DepartmentCount> departmentCounts, List<StudentResponse> recentStudents) {
        this.totalStudents = totalStudents;
        this.departmentCounts = departmentCounts;
        this.recentStudents = recentStudents;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public List<DepartmentCount> getDepartmentCounts() {
        return departmentCounts;
    }

    public void setDepartmentCounts(List<DepartmentCount> departmentCounts) {
        this.departmentCounts = departmentCounts;
    }

    public List<StudentResponse> getRecentStudents() {
        return recentStudents;
    }

    public void setRecentStudents(List<StudentResponse> recentStudents) {
        this.recentStudents = recentStudents;
    }
}
