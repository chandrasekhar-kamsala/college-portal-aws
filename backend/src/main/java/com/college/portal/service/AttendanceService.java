package com.college.portal.service;

import com.college.portal.dto.AttendanceRequest;
import com.college.portal.dto.AttendanceResponse;
import com.college.portal.dto.AttendanceSummaryResponse;

import java.util.List;

public interface AttendanceService {

    AttendanceResponse recordAttendance(AttendanceRequest request);

    AttendanceResponse updateAttendance(Long id, AttendanceRequest request);

    void deleteAttendance(Long id);

    AttendanceResponse getAttendanceById(Long id);

    List<AttendanceResponse> getAllAttendance(String semester, String subjectCode, Long studentId);

    AttendanceSummaryResponse getAttendanceSummaryForStudent(Long studentId, String semester);
}
