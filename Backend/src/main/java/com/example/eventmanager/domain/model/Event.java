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
    private Integer guestCount;
    @Builder.Default
    private EventStatus status = EventStatus.DRAFT;
    private Long catererId;
    private boolean archived;
    @Builder.Default
    private String mealType = "PLATS_FIXES";
    private LocalDateTime createdAt;
    private Long digitalTemplateId;
    private String invitationToken;
    private String invitationTitle;
    private LocalDateTime invitationDate;
    private String invitationLocation;

    public void setupInvitation(Long templateId, String token, String title, LocalDateTime date, String location) {
        this.digitalTemplateId = templateId;
        this.invitationToken = token;
        this.invitationTitle = title;
        this.invitationDate = date;
        this.invitationLocation = location;
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
