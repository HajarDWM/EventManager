package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.InvitationSetupDTO;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.domain.model.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/organizer/events")
@RequiredArgsConstructor
public class OrganiserInvitationController {

    private final EventRepositoryPort eventRepositoryPort;

    @PostMapping("/{eventId}/invitation-setup")
    public ResponseEntity<InvitationSetupDTO> setupEventInvitation(
            @PathVariable Long eventId,
            @RequestBody InvitationSetupDTO setupDTO) {

        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Événement non trouvé avec l'id : " + eventId));

        // Generate a unique token if not already present
        String token = event.getInvitationToken();
        if (token == null || token.isBlank()) {
            token = UUID.randomUUID().toString();
        }

        // Apply fallback logic: if custom fields are not specified, use event details
        String customTitle = setupDTO.getInvitationTitle();
        if (customTitle == null || customTitle.isBlank()) {
            customTitle = event.getTitle();
        }

        java.time.LocalDateTime customDate = setupDTO.getInvitationDate();
        if (customDate == null) {
            customDate = event.getEventDate();
        }

        String customLoc = setupDTO.getInvitationLocation();
        if (customLoc == null || customLoc.isBlank()) {
            customLoc = event.getLocation();
        }

        String customSubtitle = setupDTO.getInvitationSubtitle();
        if (customSubtitle == null || customSubtitle.isBlank()) {
            customSubtitle = event.getInvitationSubtitle();
        }

        String customParking = setupDTO.getParkingLocation();
        if (customParking == null || customParking.isBlank()) {
            customParking = event.getParkingLocation();
        }

        // Set setup details on domain model
        event.setupInvitation(
                setupDTO.getTemplateId(),
                setupDTO.getTemplateIdString(),
                token,
                customTitle,
                customSubtitle,
                customDate,
                customLoc,
                customParking
        );

        Event savedEvent = eventRepositoryPort.save(event);

        InvitationSetupDTO response = InvitationSetupDTO.builder()
                .templateId(savedEvent.getDigitalTemplateId())
                .templateIdString(savedEvent.getTemplateId())
                .invitationToken(savedEvent.getInvitationToken())
                .invitationTitle(savedEvent.getInvitationTitle())
                .invitationSubtitle(savedEvent.getInvitationSubtitle())
                .invitationDate(savedEvent.getInvitationDate())
                .invitationLocation(savedEvent.getInvitationLocation())
                .parkingLocation(savedEvent.getParkingLocation())
                .build();

        return ResponseEntity.ok(response);
    }
}
