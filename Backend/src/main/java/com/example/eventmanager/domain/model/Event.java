package com.example.eventmanager.domain.model;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class Event {
    private Long id;
    private String title;
    private LocalDateTime eventDate;
    private String location;
    private String locationMapUrl;
    private Integer guestCount;
    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;
    private Long catererId;
    private Long clientId;
    private boolean archived;
    @Builder.Default
    private String mealType = "PLATS_FIXES";
    private LocalDateTime createdAt;
    private Long digitalTemplateId;
    private String templateId;
    private String invitationToken;
    private String invitationTitle;
    private String invitationSubtitle;
    private LocalDateTime invitationDate;
    private String invitationLocation;
    private String parkingLocation;
    @Builder.Default
    private boolean isPaidEvent = false;
    @Builder.Default
    private Double ticketPrice = 0.0;
    @Builder.Default
    private String currency = "MAD";
    @Builder.Default
    private String tableShape = "ROUND";
    @Builder.Default
    private Integer tableCapacity = 10;
    private Integer tablesCount;

    public void setupInvitation(Long templateId, String templateIdStr, String token, String title, LocalDateTime date, String location) {
        setupInvitation(templateId, templateIdStr, token, title, this.invitationSubtitle, date, location, this.parkingLocation);
    }

    public void setupInvitation(Long templateId, String templateIdStr, String token, String title, LocalDateTime date, String location, String parkingLocation) {
        setupInvitation(templateId, templateIdStr, token, title, this.invitationSubtitle, date, location, parkingLocation);
    }

    public void setupInvitation(Long templateId, String templateIdStr, String token, String title, String subtitle, LocalDateTime date, String location, String parkingLocation) {
        this.digitalTemplateId = templateId;
        this.templateId = templateIdStr;
        this.invitationToken = token;
        this.invitationTitle = title;
        this.invitationSubtitle = subtitle;
        this.invitationDate = date;
        this.invitationLocation = location;
        this.parkingLocation = parkingLocation;
    }

    public void planEvent() {
        this.status = EventStatus.PLANNED;
    }

    public void completeEvent() {
        this.status = EventStatus.COMPLETED;
    }

    public void cancelEvent() {
        this.status = EventStatus.CANCELLED;
    }
}
