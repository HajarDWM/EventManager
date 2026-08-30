package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.GuestDTO;
import com.example.eventmanager.infrastructure.persistence.entity.EventEntity;
import com.example.eventmanager.infrastructure.persistence.entity.GuestEntity;
import com.example.eventmanager.infrastructure.persistence.repository.EventRepository;
import com.example.eventmanager.infrastructure.persistence.repository.JpaGuestRepository;
import com.example.eventmanager.infrastructure.security.model.ClientUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/client/events/{eventId}/guests")
@RequiredArgsConstructor
public class ClientGuestController {

    private final JpaGuestRepository guestRepository;
    private final EventRepository eventRepository;

    private boolean isClientAuthorizedForEvent(Long clientId, Long eventId) {
        EventEntity event = eventRepository.findById(eventId).orElse(null);
        return event != null && clientId.equals(event.getClientId());
    }

    @GetMapping
    public ResponseEntity<?> getGuests(
            @PathVariable Long eventId,
            @AuthenticationPrincipal ClientUserDetails clientDetails) {

        if (!isClientAuthorizedForEvent(clientDetails.getClientId(), eventId)) {
            return ResponseEntity.status(403).body("Access denied to this event");
        }

        List<GuestEntity> guests = guestRepository.findByEventId(eventId);
        List<GuestDTO> dtos = guests.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping
    public ResponseEntity<?> addGuest(
            @PathVariable Long eventId,
            @RequestBody GuestDTO guestDTO,
            @AuthenticationPrincipal ClientUserDetails clientDetails) {

        if (!isClientAuthorizedForEvent(clientDetails.getClientId(), eventId)) {
            return ResponseEntity.status(403).body("Access denied to this event");
        }

        GuestEntity entity = toEntity(guestDTO);
        entity.setEventId(eventId);
        GuestEntity saved = guestRepository.save(entity);
        return ResponseEntity.ok(toDTO(saved));
    }

    @PutMapping("/{guestId}")
    public ResponseEntity<?> updateGuest(
            @PathVariable Long eventId,
            @PathVariable Long guestId,
            @RequestBody GuestDTO guestDTO,
            @AuthenticationPrincipal ClientUserDetails clientDetails) {

        if (!isClientAuthorizedForEvent(clientDetails.getClientId(), eventId)) {
            return ResponseEntity.status(403).body("Access denied to this event");
        }

        return guestRepository.findById(guestId)
                .map(existing -> {
                    if (!existing.getEventId().equals(eventId)) {
                        return ResponseEntity.badRequest().body("Guest does not belong to this event");
                    }
                    existing.setFullName(guestDTO.getFullName());
                    existing.setEmail(guestDTO.getEmail());
                    existing.setPhone(guestDTO.getPhone());
                    if (guestDTO.getStatus() != null) {
                        existing.setStatus(guestDTO.getStatus().name());
                    }
                    existing.setTableNumber(guestDTO.getTableNumber());
                    existing.setDietaryRequirements(guestDTO.getDietaryRequirements());
                    existing.setGroupName(guestDTO.getGroupName());
                    GuestEntity saved = guestRepository.save(existing);
                    return ResponseEntity.ok((Object) toDTO(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{guestId}")
    public ResponseEntity<?> deleteGuest(
            @PathVariable Long eventId,
            @PathVariable Long guestId,
            @AuthenticationPrincipal ClientUserDetails clientDetails) {

        if (!isClientAuthorizedForEvent(clientDetails.getClientId(), eventId)) {
            return ResponseEntity.status(403).body("Access denied to this event");
        }

        return guestRepository.findById(guestId)
                .map(existing -> {
                    if (!existing.getEventId().equals(eventId)) {
                        return ResponseEntity.badRequest().body("Guest does not belong to this event");
                    }
                    guestRepository.delete(existing);
                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private GuestDTO toDTO(GuestEntity entity) {
        GuestDTO dto = new GuestDTO();
        dto.setId(entity.getId());
        dto.setEventId(entity.getEventId());
        dto.setFullName(entity.getFullName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setStatus(entity.getStatus() != null ? com.example.eventmanager.domain.model.GuestStatus.valueOf(entity.getStatus()) : null);
        dto.setTableNumber(entity.getTableNumber());
        dto.setDietaryRequirements(entity.getDietaryRequirements());
        dto.setGroupName(entity.getGroupName());
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setPaidAmount(entity.getPaidAmount());
        dto.setPaymentReference(entity.getPaymentReference());
        dto.setPaymentDate(entity.getPaymentDate());
        return dto;
    }

    private GuestEntity toEntity(GuestDTO dto) {
        GuestEntity entity = new GuestEntity();
        entity.setFullName(dto.getFullName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus().name() : "PENDING");
        entity.setTableNumber(dto.getTableNumber());
        entity.setDietaryRequirements(dto.getDietaryRequirements());
        entity.setGroupName(dto.getGroupName());
        return entity;
    }
}
