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
import com.example.eventmanager.application.port.out.CatererRepositoryPort;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.EventTaskRepositoryPort;
import com.example.eventmanager.application.port.out.GuestRepositoryPort;
import com.example.eventmanager.application.port.out.MenuItemRepositoryPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.exception.EventNotFoundException;
import com.example.eventmanager.domain.exception.UnauthorizedAccessException;
import com.example.eventmanager.domain.exception.SubscriptionRequiredException;
import com.example.eventmanager.domain.model.Caterer;
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
    private final CatererRepositoryPort catererRepositoryPort;
    private final EventMapper eventMapper;
    private final GuestMapper guestMapper;
    private final MenuItemMapper menuItemMapper;
    private final EventTaskMapper eventTaskMapper;
    private final SecurityContextPort securityContextPort;

    @Override
    @Transactional
    public EventDTO createEvent(EventDTO eventDTO) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        Caterer caterer = catererRepositoryPort.findById(currentCatererId)
                .orElseThrow(() -> new RuntimeException("Compte traiteur introuvable."));

        if (caterer.getRole() != com.example.eventmanager.domain.model.CatererRole.SUPER_ADMIN) {
            if (caterer.getAccountStatus() == com.example.eventmanager.domain.model.CatererStatus.SUSPENDED) {
                throw new UnauthorizedAccessException("Votre compte est suspendu. Veuillez renouveler ou mettre à niveau votre abonnement pour créer des événements.");
            }
            String plan = caterer.getSubscriptionPlan();
            int limit = switch (plan != null ? plan.toUpperCase() : "FREE") {
                case "STANDARD", "STANDARD_PRO", "STANDARD PRO" -> 8;
                case "PREMIUM" -> 20;
                default -> 2; // "FREE"
            };

            java.time.LocalDateTime startDate = caterer.getSubscriptionStartDate();
            List<Event> existingEvents = eventRepositoryPort.findAllByCatererId(currentCatererId);
            long consumedInPeriod;
            if (plan == null || "FREE".equalsIgnoreCase(plan) || plan.isBlank()) {
                consumedInPeriod = existingEvents.size();
            } else {
                consumedInPeriod = existingEvents.stream()
                        .filter(e -> startDate == null || e.getCreatedAt() == null || !e.getCreatedAt().isBefore(startDate))
                        .count();
            }
            if (consumedInPeriod >= limit) {
                if ("FREE".equalsIgnoreCase(plan) || plan == null || plan.isBlank()) {
                    throw new SubscriptionRequiredException("You have reached your free event limit. Please upgrade your plan to create more events.");
                } else {
                    throw new UnauthorizedAccessException("Quota dépassé : Vous avez atteint la limite de votre forfait. Veuillez renouveler ou mettre à niveau votre abonnement pour ajouter d'autres événements.");
                }
            }

            // Enforce guest limit (maximum 300 guests) for Free and Standard Pro plans
            if (eventDTO.getGuestCount() != null && eventDTO.getGuestCount() > 300) {
                String planUpper = plan != null ? plan.toUpperCase() : "FREE";
                if (!"PREMIUM".equals(planUpper)) {
                    throw new IllegalArgumentException("Le forfait limite le nombre d'invités à 300 par événement. Veuillez passer au forfait Premium VIP pour inviter plus de personnes.");
                }
            }
        }
        
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
                
        com.example.eventmanager.domain.model.Caterer caterer = catererRepositoryPort.findById(currentCatererId).orElse(null);
        boolean isSuperAdmin = caterer != null && "SUPER_ADMIN".equals(caterer.getRole().name());

        if (!isSuperAdmin && existingEvent.getCatererId() != null && !existingEvent.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Vous n'êtes pas autorisé à modifier cet événement.");
        }
        
        if (existingEvent.getCatererId() == null) {
            existingEvent.setCatererId(currentCatererId);
        }
        
        existingEvent.setTitle(eventDTO.getTitle());
        existingEvent.setEventDate(eventDTO.getEventDate());
        existingEvent.setLocation(eventDTO.getLocation());
        existingEvent.setGuestCount(eventDTO.getGuestCount());
        if (eventDTO.getMealType() != null) {
            existingEvent.setMealType(eventDTO.getMealType());
        }
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
                
        com.example.eventmanager.domain.model.Caterer caterer = catererRepositoryPort.findById(currentCatererId).orElse(null);
        boolean isSuperAdmin = caterer != null && "SUPER_ADMIN".equals(caterer.getRole().name());

        if (!isSuperAdmin && existingEvent.getCatererId() != null && !existingEvent.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Vous n'êtes pas autorisé à supprimer cet événement.");
        }
        
        existingEvent.setArchived(true);
        eventRepositoryPort.save(existingEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public EventDTO getEventById(Long id) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        Event event = eventRepositoryPort.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
                
        com.example.eventmanager.domain.model.Caterer caterer = catererRepositoryPort.findById(currentCatererId).orElse(null);
        boolean isSuperAdmin = caterer != null && "SUPER_ADMIN".equals(caterer.getRole().name());

        // Isolation Tenant : Vérifier l'appartenance
        if (!isSuperAdmin && !event.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Vous n'êtes pas autorisé à accéder à cet événement.");
        }
        
        return eventMapper.toDTO(event);
    }
    
    @Override
    @Transactional(readOnly = true)
    public List<EventDTO> getAllEvents(Long catererId) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        com.example.eventmanager.domain.model.Caterer caterer = catererRepositoryPort.findById(currentCatererId).orElse(null);
        boolean isSuperAdmin = caterer != null && "SUPER_ADMIN".equals(caterer.getRole().name());

        Long targetCatererId = (isSuperAdmin && catererId != null) ? catererId : currentCatererId;

        return eventRepositoryPort.findAllByCatererId(targetCatererId).stream()
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
