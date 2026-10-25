package com.college.portal.service;

import com.college.portal.dto.HallTicketRequest;
import com.college.portal.dto.HallTicketResponse;
import com.college.portal.exception.ResourceNotFoundException;
import com.college.portal.model.HallTicket;
import com.college.portal.model.Student;
import com.college.portal.repository.HallTicketRepository;
import com.college.portal.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class HallTicketServiceImpl implements HallTicketService {

    private static final Logger log = LoggerFactory.getLogger(HallTicketServiceImpl.class);

    private final HallTicketRepository hallTicketRepository;
    private final StudentRepository studentRepository;

    public HallTicketServiceImpl(HallTicketRepository hallTicketRepository, StudentRepository studentRepository) {
        this.hallTicketRepository = hallTicketRepository;
        this.studentRepository = studentRepository;
    }

    @Override
    public HallTicketResponse createHallTicket(HallTicketRequest request) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));

        String ticketNumber = request.getHallTicketNumber().trim().toUpperCase();
        if (hallTicketRepository.existsByHallTicketNumber(ticketNumber)) {
            throw new IllegalArgumentException("Hall ticket with number '" + ticketNumber + "' already exists.");
        }

        HallTicket ticket = new HallTicket(
                student,
                ticketNumber,
                request.getExamName().trim(),
                request.getSemester().trim(),
                request.getAcademicYear().trim(),
                request.getExamCenter().trim(),
                request.getExamDate().trim(),
                request.getInstructions() != null ? request.getInstructions().trim() : null,
                request.getPublished()
        );

        HallTicket saved = hallTicketRepository.save(ticket);
        log.info("Created hall ticket ID: {}, Number: {} for student: {}", saved.getId(), saved.getHallTicketNumber(), student.getRegisterNumber());
        return new HallTicketResponse(saved);
    }

    @Override
    public HallTicketResponse updateHallTicket(Long id, HallTicketRequest request) {
        HallTicket ticket = hallTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall ticket not found with ID: " + id));

        String ticketNumber = request.getHallTicketNumber().trim().toUpperCase();
        if (hallTicketRepository.existsByHallTicketNumberAndIdNot(ticketNumber, id)) {
            throw new IllegalArgumentException("Another hall ticket with number '" + ticketNumber + "' already exists.");
        }

        if (!ticket.getStudent().getId().equals(request.getStudentId())) {
            Student student = studentRepository.findById(request.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + request.getStudentId()));
            ticket.setStudent(student);
        }

        ticket.setHallTicketNumber(ticketNumber);
        ticket.setExamName(request.getExamName().trim());
        ticket.setSemester(request.getSemester().trim());
        ticket.setAcademicYear(request.getAcademicYear().trim());
        ticket.setExamCenter(request.getExamCenter().trim());
        ticket.setExamDate(request.getExamDate().trim());
        ticket.setInstructions(request.getInstructions() != null ? request.getInstructions().trim() : null);
        if (request.getPublished() != null) {
            ticket.setPublished(request.getPublished());
        }

        HallTicket updated = hallTicketRepository.save(ticket);
        return new HallTicketResponse(updated);
    }

    @Override
    public HallTicketResponse togglePublish(Long id, Boolean published) {
        HallTicket ticket = hallTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall ticket not found with ID: " + id));

        ticket.setPublished(published != null ? published : !ticket.getPublished());
        HallTicket updated = hallTicketRepository.save(ticket);
        log.info("Hall ticket ID: {} published status changed to: {}", id, updated.getPublished());
        return new HallTicketResponse(updated);
    }

    @Override
    public void deleteHallTicket(Long id) {
        HallTicket ticket = hallTicketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall ticket not found with ID: " + id));
        hallTicketRepository.delete(ticket);
        log.info("Deleted hall ticket ID: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HallTicketResponse> getAllHallTickets() {
        return hallTicketRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(HallTicketResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<HallTicketResponse> getPublishedHallTicketsForStudent(Long studentId) {
        return hallTicketRepository.findByStudentIdAndPublishedTrueOrderByCreatedAtDesc(studentId)
                .stream()
                .map(HallTicketResponse::new)
                .collect(Collectors.toList());
    }
}
