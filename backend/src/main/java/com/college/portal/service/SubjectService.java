package com.college.portal.service;

import com.college.portal.dto.SubjectResponse;
import java.util.List;

public interface SubjectService {
    List<SubjectResponse> getCatalog(Long studentId, String semester);
    List<SubjectResponse> getEnrollments(Long studentId, String semester);
    SubjectResponse enroll(Long studentId, Long subjectId);
    void unenroll(Long studentId, Long subjectId);
}
