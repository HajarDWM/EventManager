package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.EventTaskDTO;

public interface UpdateEventTaskUseCase {
    EventTaskDTO updateEventTask(Long id, EventTaskDTO eventTaskDTO);
}
