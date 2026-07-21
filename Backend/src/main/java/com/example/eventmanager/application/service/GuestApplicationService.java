package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.GuestDTO;
import com.example.eventmanager.application.mapper.GuestMapper;
import com.example.eventmanager.application.port.in.CreateGuestUseCase;
import com.example.eventmanager.application.port.in.DeleteGuestUseCase;
import com.example.eventmanager.application.port.in.GetGuestsByEventUseCase;
import com.example.eventmanager.application.port.in.UpdateGuestUseCase;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.GuestRepositoryPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.exception.EventNotFoundException;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.Guest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GuestApplicationService implements CreateGuestUseCase, GetGuestsByEventUseCase, UpdateGuestUseCase, DeleteGuestUseCase {

    private final GuestRepositoryPort guestRepositoryPort;
    private final EventRepositoryPort eventRepositoryPort;
    private final GuestMapper guestMapper;
    private final SecurityContextPort securityContextPort;

    private void verifyEventOwnership(Long eventId) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        if (event.getCatererId() != null && !event.getCatererId().equals(currentCatererId)) {
            throw new RuntimeException("Accès non autorisé à cet événement");
        }
    }

    private void syncEventGuestCount(Long eventId) {
        Event event = eventRepositoryPort.findById(eventId).orElse(null);
        if (event != null) {
            long total = guestRepositoryPort.countByEventId(eventId);
            event.setGuestCount((int) total);
            eventRepositoryPort.save(event);
        }
    }

    @Override
    @Transactional
    public GuestDTO createGuest(Long eventId, GuestDTO guestDTO) {
        verifyEventOwnership(eventId);
        guestDTO.setEventId(eventId);
        Guest guestToSave = guestMapper.toDomain(guestDTO);
        Guest saved = guestRepositoryPort.save(guestToSave);
        syncEventGuestCount(eventId);
        return guestMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestDTO> getGuestsByEventId(Long eventId) {
        verifyEventOwnership(eventId);
        return guestRepositoryPort.findByEventId(eventId).stream()
                .map(guestMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GuestDTO updateGuest(Long guestId, GuestDTO guestDTO) {
        Guest existing = guestRepositoryPort.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Invité introuvable avec l'id: " + guestId));
        verifyEventOwnership(existing.getEventId());

        existing.updateDetails(
                guestDTO.getFullName(),
                guestDTO.getEmail(),
                guestDTO.getPhone(),
                guestDTO.getStatus(),
                guestDTO.getTableNumber(),
                guestDTO.getDietaryRequirements()
        );

        Guest updated = guestRepositoryPort.save(existing);
        return guestMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteGuest(Long guestId) {
        Guest existing = guestRepositoryPort.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Invité introuvable avec l'id: " + guestId));
        Long eventId = existing.getEventId();
        verifyEventOwnership(eventId);

        guestRepositoryPort.deleteById(guestId);
        syncEventGuestCount(eventId);
    }
}
