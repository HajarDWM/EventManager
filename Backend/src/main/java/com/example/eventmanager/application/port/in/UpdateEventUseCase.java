package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.EventDTO;

public interface UpdateEventUseCase {
    EventDTO updateEvent(Long id, EventDTO eventDTO);
    EventDTO regenerateClientToken(Long id);
}
