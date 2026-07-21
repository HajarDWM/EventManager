package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.EventTaskDTO;

public interface ToggleTaskStatusUseCase {
    EventTaskDTO toggleTaskStatus(Long id);
}
