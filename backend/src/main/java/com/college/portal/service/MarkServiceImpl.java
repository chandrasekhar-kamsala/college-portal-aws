package com.college.portal.service;

import com.college.portal.dto.MarkRequest;
import com.college.portal.dto.MarkResponse;
import com.college.portal.dto.SemesterResultResponse;
import com.college.portal.exception.ResourceNotFoundException;
import com.college.portal.model.Mark;
import com.college.portal.model.Student;
import com.college.portal.repository.MarkRepository;
import com.college.portal.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class MarkServiceImpl implements MarkService {

    private static final Logger log = LoggerFactory.getLogger(MarkServiceImpl.class);

    private final MarkRepository markRepository;
    private final StudentRepository studentRepository;

    public MarkServiceImpl(MarkRepository markRepository, StudentRepository studentRepository) {
        this.markRepository = markRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public MarkResponse recordMark(MarkRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        double maxScore = request.getMaxScore() != null && request.getMaxScore() > 0 ? request.getMaxScore() : 100.0;
        if (request.getScore() > maxScore) {
            throw new IllegalArgumentException("Score (" + request.getScore() + ") cannot exceed maximum score of " + maxScore);
        }

        Mark mark = new Mark(
                student,
                request.getSubjectCode().trim().toUpperCase(),
                request.getSubjectName().trim(),
                request.getSemester().trim(),
                request.getExamType().trim(),
                request.getScore(),
                maxScore,
                request.getCredits()
        );

        Mark saved = markRepository.save(mark);
        log.info("Recorded mark ID: {} for student: {}, grade: {}", saved.getId(), student.getRegisterNumber(), saved.getGrade());
        return new MarkResponse(saved);
    }

    @Override
    public MarkResponse updateMark(Long id, MarkRequest request) {
        Mark mark = markRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mark record not found with ID: " + id));

        double maxScore = request.getMaxScore() != null && request.getMaxScore() > 0 ? request.getMaxScore() : 100.0;
        if (request.getScore() > maxScore) {
            throw new IllegalArgumentException("Score (" + request.getScore() + ") cannot exceed maximum score of " + maxScore);
        }

        mark.setSubjectCode(request.getSubjectCode().trim().toUpperCase());
        mark.setSubjectName(request.getSubjectName().trim());
        mark.setSemester(request.getSemester().trim());
        mark.setExamType(request.getExamType().trim());
        mark.setScore(request.getScore());
        mark.setMaxScore(maxScore);
        mark.setCredits(request.getCredits() != null && request.getCredits() > 0 ? request.getCredits() : 3);
        mark.computeGradeAndPoints();

        Mark updated = markRepository.save(mark);
        return new MarkResponse(updated);
    }

    @Override
    public void deleteMark(Long id) {
        Mark mark = markRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mark record not found with ID: " + id));
        markRepository.delete(mark);
        log.info("Deleted mark record ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarkResponse> getAllMarks(String semester, Long studentId) {
        List<Mark> list;
        if (studentId != null && semester != null && !semester.trim().isEmpty() && !"ALL".equalsIgnoreCase(semester.trim())) {
            list = markRepository.findByStudentIdAndSemesterOrderBySubjectCodeAsc(studentId, semester.trim());
        } else if (studentId != null) {
            list = markRepository.findByStudentIdOrderBySemesterAscSubjectCodeAsc(studentId);
        } else if (semester != null && !semester.trim().isEmpty() && !"ALL".equalsIgnoreCase(semester.trim())) {
            list = markRepository.findBySemesterOrderBySubjectCodeAsc(semester.trim());
        } else {
            list = markRepository.findAllByOrderByCreatedAtDesc();
        }

        return list.stream().map(MarkResponse::new).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public SemesterResultResponse getSemesterResult(Long studentId, String semester) {
        List<Mark> marks = markRepository.findByStudentIdAndSemesterOrderBySubjectCodeAsc(studentId, semester);
        return computeSemesterResult(semester, marks);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SemesterResultResponse> getAllSemesterResultsForStudent(Long studentId) {
        List<Mark> allMarks = markRepository.findByStudentIdOrderBySemesterAscSubjectCodeAsc(studentId);

        Map<String, List<Mark>> bySemester = allMarks.stream()
                .collect(Collectors.groupingBy(Mark::getSemester, LinkedHashMap::new, Collectors.toList()));

        List<SemesterResultResponse> results = new ArrayList<>();
        for (Map.Entry<String, List<Mark>> entry : bySemester.entrySet()) {
            results.add(computeSemesterResult(entry.getKey(), entry.getValue()));
        }

        return results;
    }

    private SemesterResultResponse computeSemesterResult(String semester, List<Mark> marks) {
        if (marks.isEmpty()) {
            return new SemesterResultResponse(semester, 0, 0, 0.0, 0.0, 0.0, 0.0, "NO_DATA", Collections.emptyList());
        }

        int totalCredits = 0;
        double weightedPoints = 0.0;
        double totalScore = 0.0;
        double maxTotalScore = 0.0;
        boolean hasFailed = false;

        for (Mark m : marks) {
            int cred = m.getCredits() != null ? m.getCredits() : 3;
            totalCredits += cred;
            weightedPoints += (m.getGradePoints() != null ? m.getGradePoints() : 0.0) * cred;
            totalScore += m.getScore() != null ? m.getScore() : 0.0;
            maxTotalScore += m.getMaxScore() != null ? m.getMaxScore() : 100.0;
            if ("F".equalsIgnoreCase(m.getGrade())) {
                hasFailed = true;
            }
        }

        double percentage = maxTotalScore > 0 ? Math.round((totalScore / maxTotalScore) * 1000.0) / 10.0 : 0.0;
        double gpa = totalCredits > 0 ? Math.round((weightedPoints / totalCredits) * 100.0) / 100.0 : 0.0;
        String resultStatus = hasFailed ? "FAIL" : "PASS";

        List<MarkResponse> markResponses = marks.stream().map(MarkResponse::new).collect(Collectors.toList());

        return new SemesterResultResponse(
                semester,
                marks.size(),
                totalCredits,
                Math.round(totalScore * 10.0) / 10.0,
                Math.round(maxTotalScore * 10.0) / 10.0,
                percentage,
                gpa,
                resultStatus,
                markResponses
        );
    }
}
