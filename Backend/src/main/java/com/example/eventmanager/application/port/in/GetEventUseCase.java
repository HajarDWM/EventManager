package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.EventDTO;

import java.util.List;

public interface GetEventUseCase {
    EventDTO getEventById(Long id);
    List<EventDTO> getAllEvents();
}
