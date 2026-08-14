package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.EventDTO;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.EventStatus;
import org.springframework.stereotype.Component;

@Component
public class EventMapper {

    public Event toDomain(EventDTO dto) {
        if (dto == null) {
            return null;
        }
        
        Event.EventBuilder builder = Event.builder()
                .id(dto.getId())
                .title(dto.getTitle())
                .eventDate(dto.getEventDate())
                .location(dto.getLocation())
                .guestCount(dto.getGuestCount())
                .catererId(dto.getCatererId())
                .createdAt(dto.getCreatedAt())
                .digitalTemplateId(dto.getDigitalTemplateId())
                .invitationToken(dto.getInvitationToken())
                .invitationTitle(dto.getInvitationTitle())
                .invitationSubtitle(dto.getInvitationSubtitle())
                .invitationDate(dto.getInvitationDate())
                .invitationLocation(dto.getInvitationLocation())
                .parkingLocation(dto.getParkingLocation())
                .mealType(dto.getMealType())
                .templateId(dto.getTemplateId())
                .isPaidEvent(dto.getIsPaidEvent() != null ? dto.getIsPaidEvent() : false)
                .ticketPrice(dto.getTicketPrice() != null ? dto.getTicketPrice() : 0.0)
                .currency(dto.getCurrency() != null ? dto.getCurrency() : "MAD");

        if (dto.getStatus() != null) {
            builder.status(EventStatus.valueOf(dto.getStatus()));
        }

        return builder.build();
    }

    public EventDTO toDTO(Event event) {
        if (event == null) {
            return null;
        }

        return EventDTO.builder()
                .id(event.getId())
                .title(event.getTitle())
                .eventDate(event.getEventDate())
                .location(event.getLocation())
                .guestCount(event.getGuestCount())
                .status(event.getStatus() != null ? event.getStatus().name() : null)
                .catererId(event.getCatererId())
                .createdAt(event.getCreatedAt())
                .digitalTemplateId(event.getDigitalTemplateId())
                .templateId(event.getTemplateId())
                .invitationToken(event.getInvitationToken())
                .invitationTitle(event.getInvitationTitle())
                .invitationSubtitle(event.getInvitationSubtitle())
                .invitationDate(event.getInvitationDate())
                .invitationLocation(event.getInvitationLocation())
                .parkingLocation(event.getParkingLocation())
                .mealType(event.getMealType())
                .isPaidEvent(event.isPaidEvent())
                .ticketPrice(event.getTicketPrice())
                .currency(event.getCurrency())
                .build();
    }
}
