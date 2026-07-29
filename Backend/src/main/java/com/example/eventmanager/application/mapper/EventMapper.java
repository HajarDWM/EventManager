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
                .invitationDate(dto.getInvitationDate())
                .invitationLocation(dto.getInvitationLocation())
                .mealType(dto.getMealType());

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
                .invitationToken(event.getInvitationToken())
                .invitationTitle(event.getInvitationTitle())
                .invitationDate(event.getInvitationDate())
                .invitationLocation(event.getInvitationLocation())
                .mealType(event.getMealType())
                .build();
    }
}
