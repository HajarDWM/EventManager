package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.EventTaskDTO;

public interface CreateEventTaskUseCase {
    EventTaskDTO createEventTask(Long eventId, EventTaskDTO eventTaskDTO);
}
