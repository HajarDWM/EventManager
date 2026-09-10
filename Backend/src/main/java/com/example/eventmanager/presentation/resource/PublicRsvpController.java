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



    @GetMapping("/{token}")
    public ResponseEntity<PublicRsvpDTO> getPublicRsvpDetail(@PathVariable String token) {
        Guest guest = guestRepositoryPort.findByInvitationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Lien d'invitation invalide ou introuvable."));

        if (guest.getInvitationExpiry() != null && java.time.LocalDateTime.now().isAfter(guest.getInvitationExpiry())) {
            throw new IllegalArgumentException("Ce lien d'invitation a expiré.");
        }

        Event event = eventRepositoryPort.findById(guest.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Événement non trouvé avec l'id : " + guest.getEventId()));

        java.util.List<com.example.eventmanager.application.dto.MenuItemDTO> menuItems = menuItemRepositoryPort.findByEventId(event.getId())
                .stream()
                .map(menuItemMapper::toDTO)
                .toList();

        String templateCategory = "Corporate";
        String templateSubCategory = null;
        String templateTitle = null;
        String decorativeFrame = null;
        String accentColor = null;
        String backgroundColor = null;
        String templateBackgroundImageUrl = null;
        String templateBackgroundImageDesktopUrl = null;
        String primaryFont = null;
        String primaryFontSize = null;
        String primaryFontWeight = null;
        String primaryLetterSpacing = null;
        String secondaryFont = null;
        String secondaryFontSize = null;
        String secondaryFontWeight = null;
        String secondaryLetterSpacing = null;
        String secondaryFontColor = null;
        String templateMusicUrl = null;
        String resolvedTemplateKey = event.getTemplateId();

        java.util.Optional<com.example.eventmanager.infrastructure.persistence.entity.DigitalInvitationTemplateEntity> tplOpt = java.util.Optional.empty();
        if (event.getDigitalTemplateId() != null) {
            tplOpt = templateRepository.findById(event.getDigitalTemplateId());
        }
        if (tplOpt.isEmpty() && event.getTemplateId() != null && !event.getTemplateId().isBlank()) {
            tplOpt = templateRepository.findByTemplateKeyIgnoreCase(event.getTemplateId());
        }

        if (tplOpt.isPresent()) {
            var tpl = tplOpt.get();
            templateCategory = tpl.getCategory();
            templateSubCategory = tpl.getSubCategory();
            templateTitle = tpl.getTitle();
            decorativeFrame = tpl.getDecorativeFrame();
            accentColor = tpl.getAccentColor();
            backgroundColor = tpl.getBackgroundColor();
            templateBackgroundImageUrl = tpl.getBackgroundImageUrl();
            templateBackgroundImageDesktopUrl = tpl.getBackgroundImageDesktopUrl();
            primaryFont = tpl.getPrimaryFont();
            primaryFontSize = tpl.getPrimaryFontSize();
            primaryFontWeight = tpl.getPrimaryFontWeight();
            primaryLetterSpacing = tpl.getPrimaryLetterSpacing();
            secondaryFont = tpl.getSecondaryFont();
            secondaryFontSize = tpl.getSecondaryFontSize();
            secondaryFontWeight = tpl.getSecondaryFontWeight();
            secondaryLetterSpacing = tpl.getSecondaryLetterSpacing();
            secondaryFontColor = tpl.getSecondaryFontColor();
            templateMusicUrl = tpl.getMusicUrl();
            if (resolvedTemplateKey == null || resolvedTemplateKey.isBlank()) {
                resolvedTemplateKey = tpl.getTemplateKey();
            }
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
                .locationMapUrl(event.getLocationMapUrl())
                .digitalTemplateId(event.getDigitalTemplateId())
                .invitationTitle(event.getInvitationTitle())
                .invitationSubtitle(event.getInvitationSubtitle())
                .invitationDate(event.getInvitationDate())
                .invitationLocation(event.getInvitationLocation())
                .parkingLocation(event.getParkingLocation())
                .mealType(event.getMealType())
                .templateCategory(templateCategory)
                .templateSubCategory(templateSubCategory)
                .templateId(resolvedTemplateKey)
                .templateTitle(templateTitle)
                .decorativeFrame(decorativeFrame)
                .accentColor(accentColor)
                .backgroundColor(backgroundColor)
                .templateBackgroundImageUrl(templateBackgroundImageUrl)
                .templateBackgroundImageDesktopUrl(templateBackgroundImageDesktopUrl)
                .primaryFont(primaryFont)
                .primaryFontSize(primaryFontSize)
                .primaryFontWeight(primaryFontWeight)
                .primaryLetterSpacing(primaryLetterSpacing)
                .secondaryFont(secondaryFont)
                .secondaryFontSize(secondaryFontSize)
                .secondaryFontWeight(secondaryFontWeight)
                .secondaryLetterSpacing(secondaryLetterSpacing)
                .secondaryFontColor(secondaryFontColor)
                .templateMusicUrl(templateMusicUrl)
                .menuItems(menuItems)
                .isPaidEvent(event.isPaidEvent())
                .ticketPrice(event.getTicketPrice())
                .currency(event.getCurrency())
                .paymentStatus(guest.getPaymentStatus())
                .paidAmount(guest.getPaidAmount())
                .paymentReference(guest.getPaymentReference())
                .paymentDate(guest.getPaymentDate())
                .build();

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/{token}")
    public ResponseEntity<PublicRsvpDTO> updatePublicRsvpResponse(
            @PathVariable String token,
            @RequestBody PublicRsvpDTO rsvpDTO) {

        Guest guest = guestRepositoryPort.findByInvitationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Lien d'invitation invalide ou introuvable."));


        Event event = eventRepositoryPort.findById(guest.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Événement non trouvé avec l'id : " + guest.getEventId()));

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
                rsvpDTO.getDietaryRequirements(),
                guest.getGroupName()
        );

        // If it's a paid event and guest is confirming, set paymentStatus accordingly
        if (event.isPaidEvent()) {
            if ("NOT_REQUIRED".equalsIgnoreCase(guest.getPaymentStatus()) || guest.getPaymentStatus() == null) {
                if (statusVal == GuestStatus.CONFIRMED) {
                    guest.setPaymentStatus("UNPAID");
                }
            }
        } else {
            guest.setPaymentStatus("NOT_REQUIRED");
        }

        Guest savedGuest = guestRepositoryPort.save(guest);

        java.util.List<com.example.eventmanager.application.dto.MenuItemDTO> menuItems = menuItemRepositoryPort.findByEventId(event.getId())
                .stream()
                .map(menuItemMapper::toDTO)
                .toList();

        String templateCategory = "Corporate";
        String templateSubCategory = null;
        String templateTitle = null;
        String decorativeFrame = null;
        String accentColor = null;
        String backgroundColor = null;
        String templateBackgroundImageUrl = null;
        String templateBackgroundImageDesktopUrl = null;
        String primaryFont = null;
        String primaryFontSize = null;
        String primaryFontWeight = null;
        String primaryLetterSpacing = null;
        String secondaryFont = null;
        String secondaryFontSize = null;
        String secondaryFontWeight = null;
        String secondaryLetterSpacing = null;
        String secondaryFontColor = null;
        String templateMusicUrl = null;
        String resolvedTemplateKey = event.getTemplateId();

        if (event.getDigitalTemplateId() != null) {
            var tplOpt = templateRepository.findById(event.getDigitalTemplateId());
            if (tplOpt.isPresent()) {
                var tpl = tplOpt.get();
                templateCategory = tpl.getCategory();
                templateSubCategory = tpl.getSubCategory();
                templateTitle = tpl.getTitle();
                decorativeFrame = tpl.getDecorativeFrame();
                accentColor = tpl.getAccentColor();
                backgroundColor = tpl.getBackgroundColor();
                templateBackgroundImageUrl = tpl.getBackgroundImageUrl();
                templateBackgroundImageDesktopUrl = tpl.getBackgroundImageDesktopUrl();
                primaryFont = tpl.getPrimaryFont();
                primaryFontSize = tpl.getPrimaryFontSize();
                primaryFontWeight = tpl.getPrimaryFontWeight();
                primaryLetterSpacing = tpl.getPrimaryLetterSpacing();
                secondaryFont = tpl.getSecondaryFont();
                secondaryFontSize = tpl.getSecondaryFontSize();
                secondaryFontWeight = tpl.getSecondaryFontWeight();
                secondaryLetterSpacing = tpl.getSecondaryLetterSpacing();
                secondaryFontColor = tpl.getSecondaryFontColor();
                templateMusicUrl = tpl.getMusicUrl();
                if (resolvedTemplateKey == null || resolvedTemplateKey.isBlank()) {
                    resolvedTemplateKey = tpl.getTemplateKey();
                }
            }
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
                .locationMapUrl(event.getLocationMapUrl())
                .digitalTemplateId(event.getDigitalTemplateId())
                .invitationTitle(event.getInvitationTitle())
                .invitationSubtitle(event.getInvitationSubtitle())
                .invitationDate(event.getInvitationDate())
                .invitationLocation(event.getInvitationLocation())
                .parkingLocation(event.getParkingLocation())
                .mealType(event.getMealType())
                .templateCategory(templateCategory)
                .templateSubCategory(templateSubCategory)
                .templateId(resolvedTemplateKey)
                .templateTitle(templateTitle)
                .decorativeFrame(decorativeFrame)
                .accentColor(accentColor)
                .backgroundColor(backgroundColor)
                .templateBackgroundImageUrl(templateBackgroundImageUrl)
                .templateBackgroundImageDesktopUrl(templateBackgroundImageDesktopUrl)
                .primaryFont(primaryFont)
                .primaryFontSize(primaryFontSize)
                .primaryFontWeight(primaryFontWeight)
                .primaryLetterSpacing(primaryLetterSpacing)
                .secondaryFont(secondaryFont)
                .secondaryFontSize(secondaryFontSize)
                .secondaryFontWeight(secondaryFontWeight)
                .secondaryLetterSpacing(secondaryLetterSpacing)
                .secondaryFontColor(secondaryFontColor)
                .templateMusicUrl(templateMusicUrl)
                .menuItems(menuItems)
                .isPaidEvent(event.isPaidEvent())
                .ticketPrice(event.getTicketPrice())
                .currency(event.getCurrency())
                .paymentStatus(savedGuest.getPaymentStatus())
                .paidAmount(savedGuest.getPaidAmount())
                .paymentReference(savedGuest.getPaymentReference())
                .paymentDate(savedGuest.getPaymentDate())
                .build();

        return ResponseEntity.ok(responseDto);
    }

    @PostMapping("/{token}/pay")
    public ResponseEntity<PublicRsvpDTO> processGuestPayment(
            @PathVariable String token,
            @RequestBody java.util.Map<String, Object> paymentPayload) {

        Guest guest = guestRepositoryPort.findByInvitationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Lien d'invitation invalide ou introuvable."));


        Event event = eventRepositoryPort.findById(guest.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Événement non trouvé avec l'id : " + guest.getEventId()));

        Double amount = event.getTicketPrice() != null ? event.getTicketPrice() : 0.0;
        if (paymentPayload.containsKey("amount") && paymentPayload.get("amount") != null) {
            amount = Double.valueOf(paymentPayload.get("amount").toString());
        }

        String reference = "PAY-" + System.currentTimeMillis() + "-" + guest.getId();
        if (paymentPayload.containsKey("reference") && paymentPayload.get("reference") != null) {
            reference = paymentPayload.get("reference").toString();
        }

        guest.recordPayment(amount, reference);
        Guest saved = guestRepositoryPort.save(guest);

        return getPublicRsvpDetail(saved.getInvitationToken());
    }
}
