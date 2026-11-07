package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.*;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.GuestRepositoryPort;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.EventStatus;
import com.example.eventmanager.domain.model.Guest;
import com.example.eventmanager.domain.model.GuestStatus;
import com.example.eventmanager.infrastructure.persistence.repository.DigitalInvitationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public/express")
@RequiredArgsConstructor
public class ExpressInvitationController {

    private final EventRepositoryPort eventRepositoryPort;
    private final GuestRepositoryPort guestRepositoryPort;
    private final DigitalInvitationTemplateRepository templateRepository;
    private final com.example.eventmanager.application.port.out.CatererRepositoryPort catererRepositoryPort;

    @PostMapping("/create")
    public ResponseEntity<ExpressInvitationResponseDTO> createExpressInvitation(@RequestBody ExpressInvitationRequestDTO req) {
        LocalDateTime eventDateTime = LocalDateTime.now().plusDays(14);
        if (req.getEventDate() != null && !req.getEventDate().isBlank()) {
            try {
                eventDateTime = LocalDateTime.parse(req.getEventDate());
            } catch (Exception ignored) {
                try {
                    eventDateTime = LocalDateTime.parse(req.getEventDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                } catch (Exception ignored2) {
                    try {
                        eventDateTime = java.time.LocalDate.parse(req.getEventDate()).atTime(18, 0);
                    } catch (Exception ignored3) {}
                }
            }
        }

        String eventToken = UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        Long defaultCatererId = catererRepositoryPort.findAll().stream()
                .findFirst()
                .map(com.example.eventmanager.domain.model.Caterer::getId)
                .orElse(1L);

        String subtitle = req.getInvitationSubtitle();
        if (subtitle != null && (subtitle.toLowerCase().contains("immense joie") || subtitle.toLowerCase().contains("notre union"))) {
            subtitle = "Le Mariage de";
        }

        Event event = Event.builder()
                .title(req.getTitle() != null && !req.getTitle().isBlank() ? req.getTitle() : "Mon Événement")
                .eventDate(eventDateTime)
                .location(req.getLocation() != null ? req.getLocation() : "À définir")
                .locationMapUrl(req.getLocationMapUrl())
                .invitationTitle(req.getTitle())
                .invitationSubtitle(subtitle)
                .invitationDate(eventDateTime)
                .invitationLocation(req.getLocation())
                .catererId(defaultCatererId)
                .guestCount(0)
                .status(EventStatus.PLANNED)
                .digitalTemplateId(req.getDigitalTemplateId())
                .invitationToken(eventToken)
                .build();

        Event savedEvent = eventRepositoryPort.save(event);

        String templateTitle = "Modèle Standard";
        if (req.getDigitalTemplateId() != null) {
            templateTitle = templateRepository.findById(req.getDigitalTemplateId())
                    .map(com.example.eventmanager.infrastructure.persistence.entity.DigitalInvitationTemplateEntity::getTitle)
                    .orElse("Modèle Standard");
        }

        ExpressInvitationResponseDTO response = ExpressInvitationResponseDTO.builder()
                .eventId(savedEvent.getId())
                .eventToken(savedEvent.getInvitationToken())
                .title(savedEvent.getTitle())
                .eventDate(savedEvent.getEventDate().toString())
                .location(savedEvent.getLocation())
                .locationMapUrl(savedEvent.getLocationMapUrl())
                .invitationSubtitle(savedEvent.getInvitationSubtitle())
                .digitalTemplateId(savedEvent.getDigitalTemplateId())
                .templateTitle(templateTitle)
                .generalInviteLink("/rsvp/" + savedEvent.getInvitationToken())
                .guests(List.of())
                .build();

        return ResponseEntity.ok(response);
    }

    @RequestMapping(value = "/{eventId}", method = {RequestMethod.PUT, RequestMethod.POST})
    public ResponseEntity<ExpressInvitationResponseDTO> updateExpressInvitation(
            @PathVariable Long eventId,
            @RequestBody ExpressInvitationRequestDTO req) {

        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Événement introuvable avec l'ID: " + eventId));

        if (req.getTitle() != null && !req.getTitle().isBlank()) {
            event.setTitle(req.getTitle().trim());
            event.setInvitationTitle(req.getTitle().trim());
        }

        if (req.getEventDate() != null && !req.getEventDate().isBlank()) {
            try {
                LocalDateTime dt = LocalDateTime.parse(req.getEventDate());
                event.setEventDate(dt);
                event.setInvitationDate(dt);
            } catch (Exception ignored) {
                try {
                    LocalDateTime dt = LocalDateTime.parse(req.getEventDate(), DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
                    event.setEventDate(dt);
                    event.setInvitationDate(dt);
                } catch (Exception ignored2) {
                    try {
                        LocalDateTime dt = java.time.LocalDate.parse(req.getEventDate()).atTime(18, 0);
                        event.setEventDate(dt);
                        event.setInvitationDate(dt);
                    } catch (Exception ignored3) {}
                }
            }
        }

        if (req.getLocation() != null) {
            event.setLocation(req.getLocation().trim());
            event.setInvitationLocation(req.getLocation().trim());
        }

        if (req.getLocationMapUrl() != null) {
            event.setLocationMapUrl(req.getLocationMapUrl().trim());
        }

        if (req.getInvitationSubtitle() != null) {
            String subtitle = req.getInvitationSubtitle().trim();
            if (subtitle.toLowerCase().contains("immense joie") || subtitle.toLowerCase().contains("notre union")) {
                subtitle = "Le Mariage de";
            }
            event.setInvitationSubtitle(subtitle);
        }

        if (req.getDigitalTemplateId() != null) {
            event.setDigitalTemplateId(req.getDigitalTemplateId());
        }

        Event savedEvent = eventRepositoryPort.save(event);

        List<ExpressGuestResponseDTO> guests = guestRepositoryPort.findByEventId(savedEvent.getId()).stream()
                .map(g -> mapGuestToDTO(g, savedEvent))
                .toList();

        String templateTitle = "Modèle Standard";
        if (savedEvent.getDigitalTemplateId() != null) {
            templateTitle = templateRepository.findById(savedEvent.getDigitalTemplateId())
                    .map(com.example.eventmanager.infrastructure.persistence.entity.DigitalInvitationTemplateEntity::getTitle)
                    .orElse("Modèle Standard");
        }

        ExpressInvitationResponseDTO response = ExpressInvitationResponseDTO.builder()
                .eventId(savedEvent.getId())
                .eventToken(savedEvent.getInvitationToken())
                .title(savedEvent.getTitle())
                .eventDate(savedEvent.getEventDate().toString())
                .location(savedEvent.getLocation())
                .locationMapUrl(savedEvent.getLocationMapUrl())
                .invitationSubtitle(savedEvent.getInvitationSubtitle())
                .digitalTemplateId(savedEvent.getDigitalTemplateId())
                .templateTitle(templateTitle)
                .generalInviteLink("/rsvp/" + savedEvent.getInvitationToken())
                .guests(guests)
                .build();

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{eventId}/guests")
    public ResponseEntity<ExpressGuestResponseDTO> addExpressGuest(
            @PathVariable Long eventId,
            @RequestBody ExpressGuestRequestDTO req) {

        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Événement introuvable avec l'ID: " + eventId));

        if (req.getPhone() == null || req.getPhone().trim().isBlank()) {
            throw new IllegalArgumentException("Le numéro WhatsApp est obligatoire pour envoyer l'invitation.");
        }

        String guestToken = UUID.randomUUID().toString().replace("-", "").substring(0, 16);

        Guest guest = Guest.builder()
                .eventId(eventId)
                .fullName(req.getFullName() != null && !req.getFullName().isBlank() ? req.getFullName() : "Invité")
                .phone(req.getPhone())
                .status(GuestStatus.PENDING)
                .invitationToken(guestToken)
                .build();

        Guest savedGuest = guestRepositoryPort.save(guest);

        return ResponseEntity.ok(mapGuestToDTO(savedGuest, event));
    }

    @PostMapping("/{eventId}/guests/batch")
    public ResponseEntity<List<ExpressGuestResponseDTO>> addExpressGuestsBatch(
            @PathVariable Long eventId,
            @RequestBody List<ExpressGuestRequestDTO> requests) {

        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Événement introuvable avec l'ID: " + eventId));

        if (requests == null || requests.isEmpty()) {
            return ResponseEntity.ok(List.of());
        }

        List<ExpressGuestResponseDTO> savedList = new ArrayList<>();
        for (ExpressGuestRequestDTO req : requests) {
            if (req.getPhone() == null || req.getPhone().trim().isBlank()) {
                continue;
            }

            String guestToken = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
            Guest guest = Guest.builder()
                    .eventId(eventId)
                    .fullName(req.getFullName() != null && !req.getFullName().trim().isBlank() ? req.getFullName().trim() : "Invité")
                    .phone(req.getPhone().trim())
                    .status(GuestStatus.PENDING)
                    .invitationToken(guestToken)
                    .build();

            Guest savedGuest = guestRepositoryPort.save(guest);
            savedList.add(mapGuestToDTO(savedGuest, event));
        }

        return ResponseEntity.ok(savedList);
    }

    @GetMapping("/{eventId}/guests")
    public ResponseEntity<List<ExpressGuestResponseDTO>> getExpressGuests(@PathVariable Long eventId) {
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Événement introuvable avec l'ID: " + eventId));

        List<ExpressGuestResponseDTO> list = guestRepositoryPort.findByEventId(eventId).stream()
                .map(g -> mapGuestToDTO(g, event))
                .toList();

        return ResponseEntity.ok(list);
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<ExpressInvitationResponseDTO> getExpressEvent(@PathVariable Long eventId) {
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new IllegalArgumentException("Événement introuvable avec l'ID: " + eventId));

        List<ExpressGuestResponseDTO> guests = guestRepositoryPort.findByEventId(eventId).stream()
                .map(g -> mapGuestToDTO(g, event))
                .toList();

        String templateTitle = "Modèle Standard";
        if (event.getDigitalTemplateId() != null) {
            templateTitle = templateRepository.findById(event.getDigitalTemplateId())
                    .map(com.example.eventmanager.infrastructure.persistence.entity.DigitalInvitationTemplateEntity::getTitle)
                    .orElse("Modèle Standard");
        }

        ExpressInvitationResponseDTO response = ExpressInvitationResponseDTO.builder()
                .eventId(event.getId())
                .eventToken(event.getInvitationToken())
                .title(event.getTitle())
                .eventDate(event.getEventDate().toString())
                .location(event.getLocation())
                .locationMapUrl(event.getLocationMapUrl())
                .invitationSubtitle(event.getInvitationSubtitle())
                .digitalTemplateId(event.getDigitalTemplateId())
                .templateTitle(templateTitle)
                .generalInviteLink("/rsvp/" + event.getInvitationToken())
                .guests(guests)
                .build();

        return ResponseEntity.ok(response);
    }

    private ExpressGuestResponseDTO mapGuestToDTO(Guest g, Event event) {
        String token = g.getInvitationToken() != null ? g.getInvitationToken() : "guest-" + g.getId();
        String rsvpLink = "/rsvp/" + token;

        // Clean phone number (Format for Morocco WhatsApp: 06XXXXXXXX -> 2126XXXXXXXX)
        String phone = g.getPhone() != null ? g.getPhone().trim().replaceAll("[^0-9+]", "") : "";
        if (phone.startsWith("0")) {
            phone = "212" + phone.substring(1);
        } else if (phone.startsWith("+")) {
            phone = phone.substring(1);
        }

        String eventDateStr = event.getEventDate() != null 
                ? event.getEventDate().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"))
                : "";

        String message = String.format(
                "السلام عليكم %s،\n\n" +
                "كيتشرفوا أصحاب الحفل بالدعوة ديالكم لحضور : %s\n" +
                "📅 التاريخ : %s\n" +
                "📍 المكان : %s\n\n" +
                "للاطلاع على بطاقة الدعوة الفخمة وتأكيد الحضور أو موقع القاعة عبر GPS :\n\n" +
                "%s\n\n" +
                "حضوركم يسعدنا ويشرفنا كثيراً ! ❤️",
                g.getFullName(),
                event.getTitle(),
                eventDateStr,
                event.getLocation() != null ? event.getLocation() : "À préciser",
                rsvpLink
        );

        String encodedMessage = URLEncoder.encode(message, StandardCharsets.UTF_8);
        String whatsappUrl = phone.isBlank()
                ? "https://api.whatsapp.com/send?text=" + encodedMessage
                : "https://api.whatsapp.com/send?phone=" + phone + "&text=" + encodedMessage;

        return ExpressGuestResponseDTO.builder()
                .id(g.getId())
                .eventId(g.getEventId())
                .fullName(g.getFullName())
                .phone(g.getPhone())
                .status(g.getStatus() != null ? g.getStatus().name() : "PENDING")
                .invitationToken(token)
                .rsvpLink(rsvpLink)
                .whatsappShareUrl(whatsappUrl)
                .build();
    }
}

