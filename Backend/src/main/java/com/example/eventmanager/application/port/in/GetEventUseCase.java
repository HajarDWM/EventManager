package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.EventDTO;

public interface GetEventUseCase {
    EventDTO getEventById(Long id);
}
