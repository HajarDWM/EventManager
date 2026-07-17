package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.EventDTO;

public interface CreateEventUseCase {
    EventDTO createEvent(EventDTO eventDTO);
}
