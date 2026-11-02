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
    private final com.example.eventmanager.infrastructure.persistence.repository.ClientRepository clientRepository;
    private final com.example.eventmanager.infrastructure.persistence.mapper.ClientPersistenceMapper clientPersistenceMapper;
    private final com.example.eventmanager.infrastructure.persistence.repository.EventRepository eventJpaRepository;
    private final com.example.eventmanager.infrastructure.persistence.repository.QuoteRepository quoteRepository;
    private final com.example.eventmanager.infrastructure.persistence.repository.InvoiceRepository invoiceRepository;

    @Override
    @Transactional
    public EventDTO createEvent(EventDTO eventDTO) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        Caterer caterer = catererRepositoryPort.findById(currentCatererId)
                .orElseThrow(() -> new RuntimeException("Compte traiteur introuvable."));

        if (caterer.getRole() != com.example.eventmanager.domain.model.CatererRole.SUPER_ADMIN) {
            if (caterer.getAccountStatus() == com.example.eventmanager.domain.model.CatererStatus.SUSPENDED) {
                throw new UnauthorizedAccessException("Votre compte est suspendu par l'administrateur.");
            }
            // Note: Les restrictions de quotas et d'expiration d'abonnement sont temporairement désactivées
            // pour permettre aux organisateurs de tester et d'utiliser l'application sans blocage.
        }
        
        Event eventToSave = eventMapper.toDomain(eventDTO);
        
        // Sécurité : Forcer le catererId avec celui du jeton JWT
        eventToSave.setCatererId(currentCatererId);
        
        if (eventToSave.getStatus() == null) {
            eventToSave.setStatus(EventStatus.DRAFT);
        }
        if (eventToSave.getInvitationLocation() == null || eventToSave.getInvitationLocation().isBlank()) {
            eventToSave.setInvitationLocation(eventToSave.getLocation());
        }
        if (eventToSave.getInvitationTitle() == null || eventToSave.getInvitationTitle().isBlank()) {
            eventToSave.setInvitationTitle(eventToSave.getTitle());
        }
        if (eventToSave.getInvitationDate() == null) {
            eventToSave.setInvitationDate(eventToSave.getEventDate());
        }

        // Auto-generate Client
        String cName = (eventDTO.getClientName() != null && !eventDTO.getClientName().isBlank()) 
                ? eventDTO.getClientName() 
                : "Client pour " + eventToSave.getTitle();
                
        int validityDays = (eventDTO.getClientPortalValidityDays() != null && eventDTO.getClientPortalValidityDays() > 0)
                ? eventDTO.getClientPortalValidityDays()
                : 7;
        eventToSave.setClientPortalValidityDays(validityDays);

        java.time.LocalDateTime expiresAt = eventToSave.getEventDate() != null
                ? eventToSave.getEventDate().plusDays(validityDays)
                : java.time.LocalDateTime.now().plusMonths(1);

        com.example.eventmanager.domain.model.Client client = com.example.eventmanager.domain.model.Client.builder()
                .name(cName)
                .email(eventDTO.getClientEmail())
                .phone(eventDTO.getClientPhone())
                .accessLinkToken(java.util.UUID.randomUUID().toString().replace("-", ""))
                .accessLinkExpiresAt(expiresAt)
                .build();
        com.example.eventmanager.infrastructure.persistence.entity.ClientEntity savedClient = 
                clientRepository.save(clientPersistenceMapper.toEntity(client));
        
        eventToSave.setClientId(savedClient.getId());

        Event savedEvent = eventRepositoryPort.save(eventToSave);
        EventDTO createdEventDTO = eventMapper.toDTO(savedEvent);
        createdEventDTO.setAccessLinkToken(client.getAccessLinkToken());
        createdEventDTO.setAccessLinkExpiresAt(savedClient.getAccessLinkExpiresAt());
        createdEventDTO.setClientName(savedClient.getName());
        createdEventDTO.setClientEmail(savedClient.getEmail());
        createdEventDTO.setClientPhone(savedClient.getPhone());
        return createdEventDTO;
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
        existingEvent.setLocationMapUrl(eventDTO.getLocationMapUrl());
        existingEvent.setParkingLocation(eventDTO.getParkingLocation());
        existingEvent.setInvitationLocation(eventDTO.getLocation());
        existingEvent.setInvitationTitle(eventDTO.getTitle());
        if (eventDTO.getInvitationSubtitle() != null) {
            existingEvent.setInvitationSubtitle(eventDTO.getInvitationSubtitle());
        }
        existingEvent.setInvitationDate(eventDTO.getEventDate());
        existingEvent.setGuestCount(eventDTO.getGuestCount());
        if (eventDTO.getMealType() != null) {
            existingEvent.setMealType(eventDTO.getMealType());
        }
        if (eventDTO.getStatus() != null) {
            existingEvent.setStatus(EventStatus.valueOf(eventDTO.getStatus()));
        }
        if (eventDTO.getDigitalTemplateId() != null) {
            existingEvent.setDigitalTemplateId(eventDTO.getDigitalTemplateId());
        }
        if (eventDTO.getTemplateId() != null) {
            existingEvent.setTemplateId(eventDTO.getTemplateId());
        }
        if (eventDTO.getIsPaidEvent() != null) {
            existingEvent.setPaidEvent(eventDTO.getIsPaidEvent());
        }
        if (eventDTO.getTicketPrice() != null) {
            existingEvent.setTicketPrice(eventDTO.getTicketPrice());
        }
        if (eventDTO.getCurrency() != null) {
            existingEvent.setCurrency(eventDTO.getCurrency());
        }
        if (eventDTO.getTableShape() != null) {
            existingEvent.setTableShape(eventDTO.getTableShape());
        }
        if (eventDTO.getTableCapacity() != null) {
            existingEvent.setTableCapacity(eventDTO.getTableCapacity());
        }
        if (eventDTO.getTablesCount() != null) {
            existingEvent.setTablesCount(eventDTO.getTablesCount());
        }
        if (eventDTO.getMaskGuestLastName() != null) {
            existingEvent.setMaskGuestLastName(eventDTO.getMaskGuestLastName());
        }

        // Update Client Entity if fields provided
        if (existingEvent.getClientId() != null) {
            clientRepository.findById(existingEvent.getClientId()).ifPresent(clientEntity -> {
                boolean clientUpdated = false;
                if (eventDTO.getClientName() != null && !eventDTO.getClientName().isBlank()) {
                    clientEntity.setName(eventDTO.getClientName());
                    clientUpdated = true;
                }
                if (eventDTO.getClientEmail() != null) {
                    clientEntity.setEmail(eventDTO.getClientEmail());
                    clientUpdated = true;
                }
                if (eventDTO.getClientPhone() != null) {
                    clientEntity.setPhone(eventDTO.getClientPhone());
                    clientUpdated = true;
                }
                if (eventDTO.getEventDate() != null) {
                    int valDays = existingEvent.getClientPortalValidityDays() != null ? existingEvent.getClientPortalValidityDays() : 7;
                    clientEntity.setAccessLinkExpiresAt(eventDTO.getEventDate().plusDays(valDays));
                    clientUpdated = true;
                }
                if (clientUpdated) {
                    clientRepository.save(clientEntity);
                }
            });
        }

        Event updatedEvent = eventRepositoryPort.save(existingEvent);
        return getEventById(updatedEvent.getId());
    }

    @Override
    @Transactional
    public EventDTO updateClientLinkValidity(Long id, Integer validityDays, java.time.LocalDateTime customExpiresAt) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        Event existingEvent = eventRepositoryPort.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
                
        com.example.eventmanager.domain.model.Caterer caterer = catererRepositoryPort.findById(currentCatererId).orElse(null);
        boolean isSuperAdmin = caterer != null && "SUPER_ADMIN".equals(caterer.getRole().name());

        if (!isSuperAdmin && existingEvent.getCatererId() != null && !existingEvent.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Vous n'êtes pas autorisé à modifier cet événement.");
        }

        com.example.eventmanager.infrastructure.persistence.entity.ClientEntity clientEntity = ensureDedicatedClientForEvent(existingEvent);

        java.time.LocalDateTime expiresAt;
        if (customExpiresAt != null) {
            expiresAt = customExpiresAt;
            if (existingEvent.getEventDate() != null) {
                long days = java.time.Duration.between(existingEvent.getEventDate(), customExpiresAt).toDays();
                existingEvent.setClientPortalValidityDays((int) Math.max(1, days));
            }
        } else if (validityDays != null && validityDays > 0) {
            existingEvent.setClientPortalValidityDays(validityDays);
            expiresAt = existingEvent.getEventDate() != null
                    ? existingEvent.getEventDate().plusDays(validityDays)
                    : java.time.LocalDateTime.now().plusDays(validityDays);
        } else {
            int days = existingEvent.getClientPortalValidityDays() != null ? existingEvent.getClientPortalValidityDays() : 7;
            expiresAt = existingEvent.getEventDate() != null
                    ? existingEvent.getEventDate().plusDays(days)
                    : java.time.LocalDateTime.now().plusDays(days);
        }

        clientEntity.setAccessLinkExpiresAt(expiresAt);
        clientRepository.save(clientEntity);

        eventRepositoryPort.save(existingEvent);

        return getEventById(id);
    }

    @Override
    @Transactional
    public EventDTO regenerateClientToken(Long id) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        Event existingEvent = eventRepositoryPort.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
                
        com.example.eventmanager.domain.model.Caterer caterer = catererRepositoryPort.findById(currentCatererId).orElse(null);
        boolean isSuperAdmin = caterer != null && "SUPER_ADMIN".equals(caterer.getRole().name());

        if (!isSuperAdmin && existingEvent.getCatererId() != null && !existingEvent.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Vous n'êtes pas autorisé à modifier cet événement.");
        }

        com.example.eventmanager.infrastructure.persistence.entity.ClientEntity clientEntity = ensureDedicatedClientForEvent(existingEvent);
        clientEntity.setAccessLinkToken(java.util.UUID.randomUUID().toString().replace("-", ""));
        int valDays = existingEvent.getClientPortalValidityDays() != null ? existingEvent.getClientPortalValidityDays() : 7;
        java.time.LocalDateTime expiresAt = existingEvent.getEventDate() != null
                ? existingEvent.getEventDate().plusDays(valDays)
                : java.time.LocalDateTime.now().plusDays(valDays);
        clientEntity.setAccessLinkExpiresAt(expiresAt);
        clientRepository.save(clientEntity);

        return getEventById(id);
    }

    private com.example.eventmanager.infrastructure.persistence.entity.ClientEntity ensureDedicatedClientForEvent(Event event) {
        com.example.eventmanager.infrastructure.persistence.entity.ClientEntity clientEntity = null;
        if (event.getClientId() != null) {
            clientEntity = clientRepository.findById(event.getClientId()).orElse(null);
            if (clientEntity != null) {
                long count = eventJpaRepository.countByClientId(event.getClientId());
                if (count > 1) {
                    // Shared client with another event! Decouple so this event has its own dedicated client
                    clientEntity = null;
                }
            }
        }

        int valDays = event.getClientPortalValidityDays() != null ? event.getClientPortalValidityDays() : 7;
        java.time.LocalDateTime expiresAt = event.getEventDate() != null
                ? event.getEventDate().plusDays(valDays)
                : java.time.LocalDateTime.now().plusMonths(1);

        if (clientEntity == null) {
            clientEntity = new com.example.eventmanager.infrastructure.persistence.entity.ClientEntity();
            clientEntity.setName("Client pour " + event.getTitle());
            clientEntity.setAccessLinkToken(java.util.UUID.randomUUID().toString().replace("-", ""));
            clientEntity.setAccessLinkExpiresAt(expiresAt);
            clientEntity = clientRepository.save(clientEntity);

            event.setClientId(clientEntity.getId());
            eventRepositoryPort.save(event);
        } else if (clientEntity.getAccessLinkToken() == null || clientEntity.getAccessLinkToken().isBlank()) {
            clientEntity.setAccessLinkToken(java.util.UUID.randomUUID().toString().replace("-", ""));
            clientEntity.setAccessLinkExpiresAt(expiresAt);
            clientEntity = clientRepository.save(clientEntity);
        }

        return clientEntity;
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
    @Transactional
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
        
        com.example.eventmanager.infrastructure.persistence.entity.ClientEntity clientEntity = ensureDedicatedClientForEvent(event);

        EventDTO eventDTO = eventMapper.toDTO(event);
        eventDTO.setAccessLinkToken(clientEntity.getAccessLinkToken());
        eventDTO.setAccessLinkExpiresAt(clientEntity.getAccessLinkExpiresAt());
        eventDTO.setClientName(clientEntity.getName());
        eventDTO.setClientEmail(clientEntity.getEmail());
        eventDTO.setClientPhone(clientEntity.getPhone());
        enrichFinancesAndApplySmartStatus(event, eventDTO);
        return eventDTO;
    }

    @Override
    @Transactional
    public EventDTO updateEventStatus(Long id, EventStatus status) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        Event existingEvent = eventRepositoryPort.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
                
        com.example.eventmanager.domain.model.Caterer caterer = catererRepositoryPort.findById(currentCatererId).orElse(null);
        boolean isSuperAdmin = caterer != null && "SUPER_ADMIN".equals(caterer.getRole().name());

        if (!isSuperAdmin && existingEvent.getCatererId() != null && !existingEvent.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Vous n'êtes pas autorisé à modifier cet événement.");
        }

        existingEvent.setStatus(status);
        eventRepositoryPort.save(existingEvent);
        return getEventById(id);
    }
    
    @Override
    @Transactional
    public List<EventDTO> getAllEvents(Long catererId) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        
        com.example.eventmanager.domain.model.Caterer caterer = catererRepositoryPort.findById(currentCatererId).orElse(null);
        boolean isSuperAdmin = caterer != null && "SUPER_ADMIN".equals(caterer.getRole().name());

        Long targetCatererId = (isSuperAdmin && catererId != null) ? catererId : currentCatererId;

        return eventRepositoryPort.findAllByCatererId(targetCatererId).stream()
                .map(event -> {
                    EventDTO eventDTO = eventMapper.toDTO(event);
                    if (event.getClientId() != null) {
                        clientRepository.findById(event.getClientId()).ifPresent(clientEntity -> {
                            eventDTO.setAccessLinkToken(clientEntity.getAccessLinkToken());
                            eventDTO.setAccessLinkExpiresAt(clientEntity.getAccessLinkExpiresAt());
                            eventDTO.setClientName(clientEntity.getName());
                            eventDTO.setClientEmail(clientEntity.getEmail());
                            eventDTO.setClientPhone(clientEntity.getPhone());
                        });
                    }
                    enrichFinancesAndApplySmartStatus(event, eventDTO);
                    return eventDTO;
                })
                .toList();
    }

    private void enrichFinancesAndApplySmartStatus(Event event, EventDTO dto) {
        if (quoteRepository == null || invoiceRepository == null || event == null || dto == null) {
            return;
        }

        java.util.List<com.example.eventmanager.infrastructure.persistence.entity.QuoteEntity> quotes = 
                quoteRepository.findByEventId(event.getId());
        com.example.eventmanager.infrastructure.persistence.entity.QuoteEntity globalQuote = (quotes != null) ? quotes.stream()
                .filter(q -> (q.getReference() != null && q.getReference().startsWith("QT-GLOBAL-")) 
                        || "ACCEPTED".equals(q.getStatus()) || "INVOICED".equals(q.getStatus()))
                .findFirst()
                .orElse(quotes.isEmpty() ? null : quotes.get(0)) : null;

        double totalContract = 0.0;
        if (globalQuote != null && globalQuote.getTotalTtc() != null) {
            totalContract = globalQuote.getTotalTtc().doubleValue();
        }

        java.util.List<com.example.eventmanager.infrastructure.persistence.entity.InvoiceEntity> invoices = 
                invoiceRepository.findByEventId(event.getId());
        if (totalContract == 0.0 && invoices != null && !invoices.isEmpty()) {
            totalContract = invoices.stream()
                    .filter(inv -> !"CANCELLED".equals(inv.getStatus()))
                    .map(com.example.eventmanager.infrastructure.persistence.entity.InvoiceEntity::getTotalTtc)
                    .filter(java.util.Objects::nonNull)
                    .mapToDouble(java.math.BigDecimal::doubleValue)
                    .sum();
        }

        double depositsPaid = 0.0;
        if (invoices != null) {
            depositsPaid = invoices.stream()
                    .filter(inv -> !"CANCELLED".equals(inv.getStatus()))
                    .filter(inv -> inv.getPayments() != null)
                    .flatMap(inv -> inv.getPayments().stream())
                    .map(com.example.eventmanager.infrastructure.persistence.entity.PaymentEntity::getAmount)
                    .filter(java.util.Objects::nonNull)
                    .mapToDouble(java.math.BigDecimal::doubleValue)
                    .sum();
        }

        double balanceDue = Math.max(0.0, totalContract - depositsPaid);

        dto.setTotalContractAmount(totalContract);
        dto.setDepositsPaid(depositsPaid);
        dto.setBalanceDue(balanceDue);

        // Smart Status Transition (Option 3 Hybride):
        // Automatically applied if event date has passed and event is in PLANNED or AWAITING_PAYMENT
        if (event.getEventDate() != null && java.time.LocalDateTime.now().isAfter(event.getEventDate())) {
            if (event.getStatus() == EventStatus.PLANNED || event.getStatus() == EventStatus.AWAITING_PAYMENT) {
                EventStatus targetStatus = (balanceDue > 0.001) ? EventStatus.AWAITING_PAYMENT : EventStatus.COMPLETED;
                if (event.getStatus() != targetStatus) {
                    event.setStatus(targetStatus);
                    eventRepositoryPort.save(event);
                    dto.setStatus(targetStatus.name());
                }
            }
        }
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
