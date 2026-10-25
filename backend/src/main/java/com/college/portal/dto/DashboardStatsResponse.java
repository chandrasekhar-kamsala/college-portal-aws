package com.college.portal.dto;

import java.util.List;

public class DashboardStatsResponse {

    private long totalStudents;
    private long totalActivated;
    private long totalInactive;
    private List<DepartmentCount> departmentCounts;
    private List<StudentResponse> recentStudents;

    public DashboardStatsResponse() {
    }

    public DashboardStatsResponse(long totalStudents, List<DepartmentCount> departmentCounts, List<StudentResponse> recentStudents) {
        this.totalStudents = totalStudents;
        this.totalActivated = 0;
        this.totalInactive = totalStudents;
        this.departmentCounts = departmentCounts;
        this.recentStudents = recentStudents;
    }

    public DashboardStatsResponse(long totalStudents, long totalActivated, long totalInactive,
                                  List<DepartmentCount> departmentCounts, List<StudentResponse> recentStudents) {
        this.totalStudents = totalStudents;
        this.totalActivated = totalActivated;
        this.totalInactive = totalInactive;
        this.departmentCounts = departmentCounts;
        this.recentStudents = recentStudents;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalActivated() {
        return totalActivated;
    }

    public void setTotalActivated(long totalActivated) {
        this.totalActivated = totalActivated;
    }

    public long getTotalInactive() {
        return totalInactive;
    }

    public void setTotalInactive(long totalInactive) {
        this.totalInactive = totalInactive;
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
