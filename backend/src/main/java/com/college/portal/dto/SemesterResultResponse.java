package com.college.portal.dto;

import java.util.List;

public class SemesterResultResponse {

    private String semester;
    private int totalSubjects;
    private int totalCredits;
    private double totalScore;
    private double maxTotalScore;
    private double percentage;
    private double gpa;
    private String resultStatus;
    private List<MarkResponse> marks;

    public SemesterResultResponse() {
    }

    public SemesterResultResponse(String semester, int totalSubjects, int totalCredits, double totalScore,
                                  double maxTotalScore, double percentage, double gpa, String resultStatus,
                                  List<MarkResponse> marks) {
        this.semester = semester;
        this.totalSubjects = totalSubjects;
        this.totalCredits = totalCredits;
        this.totalScore = totalScore;
        this.maxTotalScore = maxTotalScore;
        this.percentage = percentage;
        this.gpa = gpa;
        this.resultStatus = resultStatus;
        this.marks = marks;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public int getTotalSubjects() {
        return totalSubjects;
    }

    public void setTotalSubjects(int totalSubjects) {
        this.totalSubjects = totalSubjects;
    }

    public int getTotalCredits() {
        return totalCredits;
    }

    public void setTotalCredits(int totalCredits) {
        this.totalCredits = totalCredits;
    }

    public double getTotalScore() {
        return totalScore;
    }

    public void setTotalScore(double totalScore) {
        this.totalScore = totalScore;
    }

    public double getMaxTotalScore() {
        return maxTotalScore;
    }

    public void setMaxTotalScore(double maxTotalScore) {
        this.maxTotalScore = maxTotalScore;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }

    public double getGpa() {
        return gpa;
    }

    public void setGpa(double gpa) {
        this.gpa = gpa;
    }

    public String getResultStatus() {
        return resultStatus;
    }

    public void setResultStatus(String resultStatus) {
        this.resultStatus = resultStatus;
    }

    public List<MarkResponse> getMarks() {
        return marks;
    }

    public void setMarks(List<MarkResponse> marks) {
        this.marks = marks;
    }
}
