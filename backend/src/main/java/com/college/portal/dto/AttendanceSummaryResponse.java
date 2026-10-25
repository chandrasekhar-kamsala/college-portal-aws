package com.college.portal.dto;

import java.util.List;
import java.util.Map;

public class AttendanceSummaryResponse {

    private long totalSessions;
    private long presentSessions;
    private long absentSessions;
    private long lateSessions;
    private double overallPercentage;
    private List<AttendanceResponse> records;
    private List<SubjectAttendanceSummary> subjectSummaries;

    public AttendanceSummaryResponse() {
    }

    public AttendanceSummaryResponse(long totalSessions, long presentSessions, long absentSessions,
                                     long lateSessions, double overallPercentage,
                                     List<AttendanceResponse> records,
                                     List<SubjectAttendanceSummary> subjectSummaries) {
        this.totalSessions = totalSessions;
        this.presentSessions = presentSessions;
        this.absentSessions = absentSessions;
        this.lateSessions = lateSessions;
        this.overallPercentage = overallPercentage;
        this.records = records;
        this.subjectSummaries = subjectSummaries;
    }

    public long getTotalSessions() {
        return totalSessions;
    }

    public void setTotalSessions(long totalSessions) {
        this.totalSessions = totalSessions;
    }

    public long getPresentSessions() {
        return presentSessions;
    }

    public void setPresentSessions(long presentSessions) {
        this.presentSessions = presentSessions;
    }

    public long getAbsentSessions() {
        return absentSessions;
    }

    public void setAbsentSessions(long absentSessions) {
        this.absentSessions = absentSessions;
    }

    public long getLateSessions() {
        return lateSessions;
    }

    public void setLateSessions(long lateSessions) {
        this.lateSessions = lateSessions;
    }

    public double getOverallPercentage() {
        return overallPercentage;
    }

    public void setOverallPercentage(double overallPercentage) {
        this.overallPercentage = overallPercentage;
    }

    public List<AttendanceResponse> getRecords() {
        return records;
    }

    public void setRecords(List<AttendanceResponse> records) {
        this.records = records;
    }

    public List<SubjectAttendanceSummary> getSubjectSummaries() {
        return subjectSummaries;
    }

    public void setSubjectSummaries(List<SubjectAttendanceSummary> subjectSummaries) {
        this.subjectSummaries = subjectSummaries;
    }

    public static class SubjectAttendanceSummary {
        private String subjectCode;
        private String subjectName;
        private long total;
        private long present;
        private double percentage;

        public SubjectAttendanceSummary() {
        }

        public SubjectAttendanceSummary(String subjectCode, String subjectName, long total, long present, double percentage) {
            this.subjectCode = subjectCode;
            this.subjectName = subjectName;
            this.total = total;
            this.present = present;
            this.percentage = percentage;
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

        public long getTotal() {
            return total;
        }

        public void setTotal(long total) {
            this.total = total;
        }

        public long getPresent() {
            return present;
        }

        public void setPresent(long present) {
            this.present = present;
        }

        public double getPercentage() {
            return percentage;
        }

        public void setPercentage(double percentage) {
            this.percentage = percentage;
        }
    }
}
