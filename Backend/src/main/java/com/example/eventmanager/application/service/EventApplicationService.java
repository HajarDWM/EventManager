package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.EventDTO;
import com.example.eventmanager.application.mapper.EventMapper;
import com.example.eventmanager.application.port.in.CreateEventUseCase;
import com.example.eventmanager.application.port.in.GetEventUseCase;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.domain.exception.EventNotFoundException;
import com.example.eventmanager.domain.model.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EventApplicationService implements CreateEventUseCase, GetEventUseCase {

    private final EventRepositoryPort eventRepositoryPort;
    private final EventMapper eventMapper;

    @Override
    @Transactional
    public EventDTO createEvent(EventDTO eventDTO) {
        Event eventToSave = eventMapper.toDomain(eventDTO);
        
        // Par défaut, s'il n'y a pas de statut, on le met en DRAFT
        if (eventToSave.getStatus() == null) {
            eventToSave.setStatus(com.example.eventmanager.domain.model.EventStatus.DRAFT);
        }

        Event savedEvent = eventRepositoryPort.save(eventToSave);
        return eventMapper.toDTO(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public EventDTO getEventById(Long id) {
        Event event = eventRepositoryPort.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        return eventMapper.toDTO(event);
    }
}
