package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.PublicRsvpDTO;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.GuestRepositoryPort;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.Guest;
import com.example.eventmanager.domain.model.GuestStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/public/rsvp")
@RequiredArgsConstructor
public class PublicRsvpController {

    private final GuestRepositoryPort guestRepositoryPort;
    private final EventRepositoryPort eventRepositoryPort;
    private final com.example.eventmanager.application.port.out.MenuItemRepositoryPort menuItemRepositoryPort;
    private final com.example.eventmanager.application.mapper.MenuItemMapper menuItemMapper;
    private final com.example.eventmanager.infrastructure.persistence.repository.DigitalInvitationTemplateRepository templateRepository;

    @GetMapping("/debug-menu-items")
    public ResponseEntity<?> getDebugMenuItems() {
        try {
            Long catererId = 1L;
            java.util.Optional<Event> eventOpt = eventRepositoryPort.findById(24L);
            if (eventOpt.isPresent()) {
                catererId = eventOpt.get().getCatererId();
            }
            java.util.List<com.example.eventmanager.application.dto.MenuItemDTO> items = menuItemRepositoryPort.findAllByCatererId(catererId)
                    .stream()
                    .map(menuItemMapper::toDTO)
                    .toList();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            e.printStackTrace(pw);
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", e.getMessage() != null ? e.getMessage() : e.getClass().getName(),
                "stack", sw.toString()
            ));
        }
    }

    @GetMapping("/{guestId}")
    public ResponseEntity<PublicRsvpDTO> getPublicRsvpDetail(@PathVariable Long guestId) {
        Guest guest = guestRepositoryPort.findById(guestId)
                .orElseThrow(() -> new IllegalArgumentException("Invité non trouvé avec l'id : " + guestId));

        Event event = eventRepositoryPort.findById(guest.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Événement non trouvé avec l'id : " + guest.getEventId()));

        java.util.List<com.example.eventmanager.application.dto.MenuItemDTO> menuItems = new java.util.ArrayList<>();
        if ("PLATS_FIXES".equals(event.getMealType())) {
            menuItems = menuItemRepositoryPort.findByEventId(event.getId())
                    .stream()
                    .map(menuItemMapper::toDTO)
                    .toList();
        }

        String templateCategory = "Corporate";
        if (event.getDigitalTemplateId() != null) {
            templateCategory = templateRepository.findById(event.getDigitalTemplateId())
                    .map(com.example.eventmanager.infrastructure.persistence.entity.DigitalInvitationTemplateEntity::getCategory)
                    .orElse("Corporate");
        }

        PublicRsvpDTO dto = PublicRsvpDTO.builder()
                .guestId(guest.getId())
                .guestName(guest.getFullName())
                .guestEmail(guest.getEmail())
                .guestPhone(guest.getPhone())
                .guestStatus(guest.getStatus() != null ? guest.getStatus().name() : "PENDING")
                .tableNumber(guest.getTableNumber())
                .dietaryRequirements(guest.getDietaryRequirements())
                .eventId(event.getId())
                .eventTitle(event.getTitle())
                .eventDate(event.getEventDate())
                .eventLocation(event.getLocation())
                .digitalTemplateId(event.getDigitalTemplateId())
                .invitationTitle(event.getInvitationTitle())
                .invitationDate(event.getInvitationDate())
                .invitationLocation(event.getInvitationLocation())
                .mealType(event.getMealType())
                .templateCategory(templateCategory)
                .templateId(event.getTemplateId())
                .menuItems(menuItems)
                .build();

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{guestId}")
    public ResponseEntity<PublicRsvpDTO> updatePublicRsvpResponse(
            @PathVariable Long guestId,
            @RequestBody PublicRsvpDTO rsvpDTO) {

        Guest guest = guestRepositoryPort.findById(guestId)
                .orElseThrow(() -> new IllegalArgumentException("Invité non trouvé avec l'id : " + guestId));

        GuestStatus statusVal = guest.getStatus();
        if (rsvpDTO.getGuestStatus() != null) {
            statusVal = GuestStatus.valueOf(rsvpDTO.getGuestStatus().toUpperCase());
        }

        guest.updateDetails(
                guest.getFullName(),
                guest.getEmail(),
                guest.getPhone(),
                statusVal,
                guest.getTableNumber(),
                rsvpDTO.getDietaryRequirements()
        );

        Guest savedGuest = guestRepositoryPort.save(guest);

        Event event = eventRepositoryPort.findById(savedGuest.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Événement non trouvé avec l'id : " + savedGuest.getEventId()));

        java.util.List<com.example.eventmanager.application.dto.MenuItemDTO> menuItems = new java.util.ArrayList<>();
        if ("PLATS_FIXES".equals(event.getMealType())) {
            menuItems = menuItemRepositoryPort.findByEventId(event.getId())
                    .stream()
                    .map(menuItemMapper::toDTO)
                    .toList();
        }

        String templateCategory = "Corporate";
        if (event.getDigitalTemplateId() != null) {
            templateCategory = templateRepository.findById(event.getDigitalTemplateId())
                    .map(com.example.eventmanager.infrastructure.persistence.entity.DigitalInvitationTemplateEntity::getCategory)
                    .orElse("Corporate");
        }

        PublicRsvpDTO responseDto = PublicRsvpDTO.builder()
                .guestId(savedGuest.getId())
                .guestName(savedGuest.getFullName())
                .guestEmail(savedGuest.getEmail())
                .guestPhone(savedGuest.getPhone())
                .guestStatus(savedGuest.getStatus() != null ? savedGuest.getStatus().name() : "PENDING")
                .tableNumber(savedGuest.getTableNumber())
                .dietaryRequirements(savedGuest.getDietaryRequirements())
                .eventId(event.getId())
                .eventTitle(event.getTitle())
                .eventDate(event.getEventDate())
                .eventLocation(event.getLocation())
                .digitalTemplateId(event.getDigitalTemplateId())
                .invitationTitle(event.getInvitationTitle())
                .invitationDate(event.getInvitationDate())
                .invitationLocation(event.getInvitationLocation())
                .mealType(event.getMealType())
                .templateCategory(templateCategory)
                .templateId(event.getTemplateId())
                .menuItems(menuItems)
                .build();

        return ResponseEntity.ok(responseDto);
    }
}
