package com.college.portal.controller;

import com.college.portal.dto.SubjectResponse;
import com.college.portal.security.SecurityUtils;
import com.college.portal.service.SubjectService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/student/me/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping("/catalog")
    public ResponseEntity<List<SubjectResponse>> catalog(@RequestParam(required = false) String semester) {
        return ResponseEntity.ok(subjectService.getCatalog(SecurityUtils.getAuthenticatedStudentId(), semester));
    }

    @GetMapping
    public ResponseEntity<List<SubjectResponse>> enrollments(@RequestParam(required = false) String semester) {
        return ResponseEntity.ok(subjectService.getEnrollments(SecurityUtils.getAuthenticatedStudentId(), semester));
    }

    @PostMapping("/{subjectId}")
    public ResponseEntity<SubjectResponse> enroll(@PathVariable Long subjectId) {
        return ResponseEntity.ok(subjectService.enroll(SecurityUtils.getAuthenticatedStudentId(), subjectId));
    }

    @DeleteMapping("/{subjectId}")
    public ResponseEntity<Void> unenroll(@PathVariable Long subjectId) {
        subjectService.unenroll(SecurityUtils.getAuthenticatedStudentId(), subjectId);
        return ResponseEntity.noContent().build();
    }
}
