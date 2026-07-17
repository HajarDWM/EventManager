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
