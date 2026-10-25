package com.college.portal.service;

import com.college.portal.dto.HallTicketRequest;
import com.college.portal.dto.HallTicketResponse;

import java.util.List;

public interface HallTicketService {

    HallTicketResponse createHallTicket(HallTicketRequest request);

    HallTicketResponse updateHallTicket(Long id, HallTicketRequest request);

    HallTicketResponse togglePublish(Long id, Boolean published);

    void deleteHallTicket(Long id);

    List<HallTicketResponse> getAllHallTickets();

    List<HallTicketResponse> getPublishedHallTicketsForStudent(Long studentId);
}
