package com.college.portal.service;

import com.college.portal.dto.MarkRequest;
import com.college.portal.dto.MarkResponse;
import com.college.portal.dto.SemesterResultResponse;

import java.util.List;

public interface MarkService {

    MarkResponse recordMark(MarkRequest request);

    MarkResponse updateMark(Long id, MarkRequest request);

    void deleteMark(Long id);

    List<MarkResponse> getAllMarks(String semester, Long studentId);

    SemesterResultResponse getSemesterResult(Long studentId, String semester);

    List<SemesterResultResponse> getAllSemesterResultsForStudent(Long studentId);
}
