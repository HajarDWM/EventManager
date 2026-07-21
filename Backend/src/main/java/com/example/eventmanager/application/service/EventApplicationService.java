package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.EventDTO;
import com.example.eventmanager.application.dto.EventExportDTO;
import com.example.eventmanager.application.dto.EventTaskDTO;
import com.example.eventmanager.application.dto.GuestDTO;
import com.example.eventmanager.application.dto.MenuItemDTO;
import com.example.eventmanager.application.mapper.EventMapper;
import com.example.eventmanager.application.mapper.EventTaskMapper;
import com.example.eventmanager.application.mapper.GuestMapper;
import com.example.eventmanager.application.mapper.MenuItemMapper;
import com.example.eventmanager.application.port.in.*;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.EventTaskRepositoryPort;
import com.example.eventmanager.application.port.out.GuestRepositoryPort;
import com.example.eventmanager.application.port.out.MenuItemRepositoryPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.exception.EventNotFoundException;
import com.example.eventmanager.domain.exception.UnauthorizedAccessException;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.EventStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventApplicationService implements CreateEventUseCase, GetEventUseCase, UpdateEventUseCase, DeleteEventUseCase, GetEventExportDataUseCase {

    private final EventRepositoryPort eventRepositoryPort;
    private final GuestRepositoryPort guestRepositoryPort;
    private final MenuItemRepositoryPort menuItemRepositoryPort;
    private final EventTaskRepositoryPort eventTaskRepositoryPort;
    private final EventMapper eventMapper;
    private final GuestMapper guestMapper;
    private final MenuItemMapper menuItemMapper;
    private final EventTaskMapper eventTaskMapper;
    private final SecurityContextPort securityContextPort;

    @Override
    @Transactional
    public EventDTO createEvent(EventDTO eventDTO) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        Event eventToSave = eventMapper.toDomain(eventDTO);
        
        // Sécurité : Forcer le catererId avec celui du jeton JWT
        eventToSave.setCatererId(currentCatererId);
        
        if (eventToSave.getStatus() == null) {
            eventToSave.setStatus(EventStatus.DRAFT);
        }

        Event savedEvent = eventRepositoryPort.save(eventToSave);
        return eventMapper.toDTO(savedEvent);
    }

    @Override
    @Transactional
    public EventDTO updateEvent(Long id, EventDTO eventDTO) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        Event existingEvent = eventRepositoryPort.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
                
        if (existingEvent.getCatererId() != null && !existingEvent.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Vous n'êtes pas autorisé à modifier cet événement.");
        }
        
        if (existingEvent.getCatererId() == null) {
            existingEvent.setCatererId(currentCatererId);
        }
        
        existingEvent.setTitle(eventDTO.getTitle());
        existingEvent.setEventDate(eventDTO.getEventDate());
        existingEvent.setLocation(eventDTO.getLocation());
        existingEvent.setGuestCount(eventDTO.getGuestCount());
        if (eventDTO.getStatus() != null) {
            existingEvent.setStatus(EventStatus.valueOf(eventDTO.getStatus()));
        }

        Event updatedEvent = eventRepositoryPort.save(existingEvent);
        return eventMapper.toDTO(updatedEvent);
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        Event existingEvent = eventRepositoryPort.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
                
        if (existingEvent.getCatererId() != null && !existingEvent.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Vous n'êtes pas autorisé à supprimer cet événement.");
        }
        
        // Suppression en cascade des invités, plats et tâches rattachés
        guestRepositoryPort.deleteByEventId(id);
        menuItemRepositoryPort.deleteByEventId(id);
        eventTaskRepositoryPort.deleteByEventId(id);
        
        eventRepositoryPort.deleteById(id);
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

    @Override
    @Transactional(readOnly = true)
    public EventExportDTO getEventExportData(Long eventId) {
        EventDTO eventDTO = getEventById(eventId);

        List<GuestDTO> guests = guestRepositoryPort.findByEventId(eventId).stream()
                .map(guestMapper::toDTO)
                .toList();

        List<MenuItemDTO> menuItems = menuItemRepositoryPort.findByEventId(eventId).stream()
                .map(menuItemMapper::toDTO)
                .toList();

        List<EventTaskDTO> tasks = eventTaskRepositoryPort.findByEventId(eventId).stream()
                .map(eventTaskMapper::toDTO)
                .toList();

        return EventExportDTO.builder()
                .event(eventDTO)
                .guests(guests)
                .menuItems(menuItems)
                .tasks(tasks)
                .build();
    }
}
