package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.EventTaskDTO;

import java.util.List;

public interface GetTasksByEventUseCase {
    List<EventTaskDTO> getTasksByEventId(Long eventId);
}
