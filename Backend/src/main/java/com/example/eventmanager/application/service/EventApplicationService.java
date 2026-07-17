package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.EventDTO;
import com.example.eventmanager.application.mapper.EventMapper;
import com.example.eventmanager.application.port.in.CreateEventUseCase;
import com.example.eventmanager.application.port.in.GetEventUseCase;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.exception.EventNotFoundException;
import com.example.eventmanager.domain.exception.UnauthorizedAccessException;
import com.example.eventmanager.domain.model.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventApplicationService implements CreateEventUseCase, GetEventUseCase {

    private final EventRepositoryPort eventRepositoryPort;
    private final EventMapper eventMapper;
    private final SecurityContextPort securityContextPort;

    @Override
    @Transactional
    public EventDTO createEvent(EventDTO eventDTO) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        Event eventToSave = eventMapper.toDomain(eventDTO);
        
        // Sécurité : Forcer le catererId avec celui du jeton JWT
        eventToSave.setCatererId(currentCatererId);
        
        if (eventToSave.getStatus() == null) {
            eventToSave.setStatus(com.example.eventmanager.domain.model.EventStatus.DRAFT);
        }

        Event savedEvent = eventRepositoryPort.save(eventToSave);
        return eventMapper.toDTO(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public EventDTO getEventById(Long id) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        Event event = eventRepositoryPort.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
                
        // Isolation Tenant : Vérifier l'appartenance
        if (!event.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Vous n'êtes pas autorisé à accéder à cet événement.");
        }
        
        return eventMapper.toDTO(event);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getAllEvents() {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        return eventRepositoryPort.findAllByCatererId(currentCatererId).stream()
                .map(eventMapper::toDTO)
                .toList();
    }
}
