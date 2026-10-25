package com.college.portal.repository;

import com.college.portal.model.HallTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HallTicketRepository extends JpaRepository<HallTicket, Long> {

    List<HallTicket> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<HallTicket> findByStudentIdAndPublishedTrueOrderByCreatedAtDesc(Long studentId);

    Optional<HallTicket> findByHallTicketNumber(String hallTicketNumber);

    boolean existsByHallTicketNumber(String hallTicketNumber);

    boolean existsByHallTicketNumberAndIdNot(String hallTicketNumber, Long id);

    List<HallTicket> findAllByOrderByCreatedAtDesc();

    void deleteByStudentId(Long studentId);
}
