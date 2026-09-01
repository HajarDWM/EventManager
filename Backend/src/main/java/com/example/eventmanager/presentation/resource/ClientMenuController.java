package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.MenuItemDTO;
import com.example.eventmanager.infrastructure.persistence.entity.EventEntity;
import com.example.eventmanager.infrastructure.persistence.entity.MenuItemEntity;
import com.example.eventmanager.infrastructure.persistence.repository.EventRepository;
import com.example.eventmanager.infrastructure.persistence.repository.JpaMenuItemRepository;
import com.example.eventmanager.infrastructure.security.model.ClientUserDetails;
import com.example.eventmanager.application.port.out.GuestRepositoryPort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/client/events/{eventId}/menu-items")
@RequiredArgsConstructor
public class ClientMenuController {

    private final JpaMenuItemRepository menuItemRepository;
    private final EventRepository eventRepository;
    private final GuestRepositoryPort guestRepositoryPort;

    private boolean isClientAuthorizedForEvent(Long clientId, Long eventId) {
        EventEntity event = eventRepository.findById(eventId).orElse(null);
        return event != null && clientId.equals(event.getClientId());
    }

    @GetMapping
    public ResponseEntity<?> getMenuItems(
            @PathVariable Long eventId,
            @AuthenticationPrincipal ClientUserDetails clientDetails) {

        if (!isClientAuthorizedForEvent(clientDetails.getClientId(), eventId)) {
            return ResponseEntity.status(403).body("Access denied to this event");
        }

        List<MenuItemEntity> entities = menuItemRepository.findByEventId(eventId);
        List<com.example.eventmanager.domain.model.Guest> guests = guestRepositoryPort.findByEventId(eventId);
        
        List<MenuItemDTO> items = entities.stream().map(entity -> {
            MenuItemDTO dto = toDTO(entity);
            long count = guests.stream()
                .filter(g -> g.getStatus() == com.example.eventmanager.domain.model.GuestStatus.CONFIRMED)
                .filter(g -> g.getDietaryRequirements() != null && g.getDietaryRequirements().toLowerCase().contains(dto.getName().toLowerCase()))
                .count();
            dto.setSelectedCount((int) count);
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(items);
    }

    private MenuItemDTO toDTO(MenuItemEntity entity) {
        MenuItemDTO dto = new MenuItemDTO();
        dto.setId(entity.getId());
        dto.setEventId(entity.getEventId());
        dto.setName(entity.getName());
        dto.setCategory(entity.getCategory() != null ? entity.getCategory() : "OTHER");
        dto.setPricePerPerson(entity.getPricePerPerson());
        dto.setDietaryTag(entity.getDietaryTag());
        dto.setDescription(entity.getDescription());
        dto.setImageUrl(entity.getImageUrl());
        return dto;
    }
}
