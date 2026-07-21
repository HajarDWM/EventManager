package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.EventTaskDTO;
import com.example.eventmanager.application.mapper.EventTaskMapper;
import com.example.eventmanager.application.port.in.*;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.EventTaskRepositoryPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.exception.EventNotFoundException;
import com.example.eventmanager.domain.exception.UnauthorizedAccessException;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.EventTask;
import com.example.eventmanager.domain.model.TaskPriority;
import com.example.eventmanager.domain.model.TaskStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventTaskApplicationService implements CreateEventTaskUseCase, GetTasksByEventUseCase, UpdateEventTaskUseCase, DeleteEventTaskUseCase, ToggleTaskStatusUseCase {

    private final EventTaskRepositoryPort eventTaskRepositoryPort;
    private final EventRepositoryPort eventRepositoryPort;
    private final EventTaskMapper eventTaskMapper;
    private final SecurityContextPort securityContextPort;

    private void verifyEventOwnership(Long eventId) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        if (event.getCatererId() != null && !event.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Accès non autorisé à cet événement");
        }
    }

    @Override
    @Transactional
    public EventTaskDTO createEventTask(Long eventId, EventTaskDTO eventTaskDTO) {
        verifyEventOwnership(eventId);
        eventTaskDTO.setEventId(eventId);
        EventTask eventTask = eventTaskMapper.toDomain(eventTaskDTO);
        EventTask saved = eventTaskRepositoryPort.save(eventTask);
        return eventTaskMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventTaskDTO> getTasksByEventId(Long eventId) {
        verifyEventOwnership(eventId);
        return eventTaskRepositoryPort.findByEventId(eventId).stream()
                .map(eventTaskMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventTaskDTO updateEventTask(Long id, EventTaskDTO eventTaskDTO) {
        EventTask existing = eventTaskRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable avec l'id: " + id));
        verifyEventOwnership(existing.getEventId());

        TaskPriority priorityEnum = TaskPriority.MEDIUM;
        if (eventTaskDTO.getPriority() != null) {
            try {
                priorityEnum = TaskPriority.valueOf(eventTaskDTO.getPriority().toUpperCase());
            } catch (Exception ignored) {}
        }

        TaskStatus statusEnum = TaskStatus.TODO;
        if (eventTaskDTO.getStatus() != null) {
            try {
                statusEnum = TaskStatus.valueOf(eventTaskDTO.getStatus().toUpperCase());
            } catch (Exception ignored) {}
        }

        existing.updateDetails(
                eventTaskDTO.getTitle(),
                eventTaskDTO.getDescription(),
                eventTaskDTO.getDueDate(),
                priorityEnum,
                statusEnum,
                eventTaskDTO.getAssignedTo()
        );

        EventTask updated = eventTaskRepositoryPort.save(existing);
        return eventTaskMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public EventTaskDTO toggleTaskStatus(Long id) {
        EventTask existing = eventTaskRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable avec l'id: " + id));
        verifyEventOwnership(existing.getEventId());

        existing.toggleStatus();
        EventTask updated = eventTaskRepositoryPort.save(existing);
        return eventTaskMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteEventTask(Long id) {
        EventTask existing = eventTaskRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Tâche introuvable avec l'id: " + id));
        verifyEventOwnership(existing.getEventId());

        eventTaskRepositoryPort.deleteById(id);
    }
}
