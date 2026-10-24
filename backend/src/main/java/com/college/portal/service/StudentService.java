package com.college.portal.service;

import com.college.portal.dto.DashboardStatsResponse;
import com.college.portal.dto.StudentRequest;
import com.college.portal.dto.StudentResponse;

import java.util.List;

public interface StudentService {

    List<StudentResponse> getAllStudents(String department, String search);

    StudentResponse getStudentById(Long id);

    StudentResponse createStudent(StudentRequest request);

    StudentResponse updateStudent(Long id, StudentRequest request);

    void deleteStudent(Long id);

    DashboardStatsResponse getDashboardStats();
}
