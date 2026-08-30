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



    @GetMapping("/{guestId}")
    public ResponseEntity<PublicRsvpDTO> getPublicRsvpDetail(@PathVariable Long guestId) {
        Guest guest = guestRepositoryPort.findById(guestId)
                .orElseThrow(() -> new IllegalArgumentException("Invité non trouvé avec l'id : " + guestId));

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
        String primaryFont = null;
        String primaryFontSize = null;
        String secondaryFont = null;
        String secondaryFontSize = null;
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
                primaryFont = tpl.getPrimaryFont();
                primaryFontSize = tpl.getPrimaryFontSize();
                secondaryFont = tpl.getSecondaryFont();
                secondaryFontSize = tpl.getSecondaryFontSize();
                secondaryFontColor = tpl.getSecondaryFontColor();
                templateMusicUrl = tpl.getMusicUrl();
                if (resolvedTemplateKey == null || resolvedTemplateKey.isBlank()) {
                    resolvedTemplateKey = tpl.getTemplateKey();
                }
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
                .primaryFont(primaryFont)
                .primaryFontSize(primaryFontSize)
                .secondaryFont(secondaryFont)
                .secondaryFontSize(secondaryFontSize)
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

    @PostMapping("/{guestId}")
    public ResponseEntity<PublicRsvpDTO> updatePublicRsvpResponse(
            @PathVariable Long guestId,
            @RequestBody PublicRsvpDTO rsvpDTO) {

        Guest guest = guestRepositoryPort.findById(guestId)
                .orElseThrow(() -> new IllegalArgumentException("Invité non trouvé avec l'id : " + guestId));

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
        String primaryFont = null;
        String primaryFontSize = null;
        String secondaryFont = null;
        String secondaryFontSize = null;
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
                primaryFont = tpl.getPrimaryFont();
                primaryFontSize = tpl.getPrimaryFontSize();
                secondaryFont = tpl.getSecondaryFont();
                secondaryFontSize = tpl.getSecondaryFontSize();
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
                .primaryFont(primaryFont)
                .primaryFontSize(primaryFontSize)
                .secondaryFont(secondaryFont)
                .secondaryFontSize(secondaryFontSize)
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

    @PostMapping("/{guestId}/pay")
    public ResponseEntity<PublicRsvpDTO> processGuestPayment(
            @PathVariable Long guestId,
            @RequestBody java.util.Map<String, Object> paymentPayload) {

        Guest guest = guestRepositoryPort.findById(guestId)
                .orElseThrow(() -> new IllegalArgumentException("Invité non trouvé avec l'id : " + guestId));

        Event event = eventRepositoryPort.findById(guest.getEventId())
                .orElseThrow(() -> new IllegalArgumentException("Événement non trouvé avec l'id : " + guest.getEventId()));

        Double amount = event.getTicketPrice() != null ? event.getTicketPrice() : 0.0;
        if (paymentPayload.containsKey("amount") && paymentPayload.get("amount") != null) {
            amount = Double.valueOf(paymentPayload.get("amount").toString());
        }

        String reference = "PAY-" + System.currentTimeMillis() + "-" + guestId;
        if (paymentPayload.containsKey("reference") && paymentPayload.get("reference") != null) {
            reference = paymentPayload.get("reference").toString();
        }

        guest.recordPayment(amount, reference);
        Guest saved = guestRepositoryPort.save(guest);

        return getPublicRsvpDetail(saved.getId());
    }
}
