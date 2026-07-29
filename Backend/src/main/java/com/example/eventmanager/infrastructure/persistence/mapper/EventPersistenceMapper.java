package com.example.eventmanager.infrastructure.persistence.mapper;

import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.EventStatus;
import com.example.eventmanager.infrastructure.persistence.entity.EventEntity;
import org.springframework.stereotype.Component;

@Component
public class EventPersistenceMapper {

    public Event toDomain(EventEntity entity) {
        if (entity == null) {
            return null;
        }

        return Event.builder()
                .id(entity.getId())
                .title(entity.getTitle())
                .eventDate(entity.getEventDate())
                .location(entity.getLocation())
                .guestCount(entity.getGuestCount())
                .status(entity.getStatus() != null ? EventStatus.valueOf(entity.getStatus()) : EventStatus.DRAFT)
                .catererId(entity.getCatererId())
                .archived(entity.isArchived())
                .createdAt(entity.getCreatedAt())
                .digitalTemplateId(entity.getDigitalTemplateId())
                .invitationToken(entity.getInvitationToken())
                .invitationTitle(entity.getInvitationTitle())
                .invitationDate(entity.getInvitationDate())
                .invitationLocation(entity.getInvitationLocation())
                .mealType(entity.getMealType())
                .build();
    }

    public EventEntity toEntity(Event domain) {
        if (domain == null) {
            return null;
        }

        return EventEntity.builder()
                .id(domain.getId())
                .title(domain.getTitle())
                .eventDate(domain.getEventDate())
                .location(domain.getLocation())
                .guestCount(domain.getGuestCount())
                .status(domain.getStatus() != null ? domain.getStatus().name() : "DRAFT")
                .catererId(domain.getCatererId())
                .archived(domain.isArchived())
                .createdAt(domain.getCreatedAt())
                .digitalTemplateId(domain.getDigitalTemplateId())
                .invitationToken(domain.getInvitationToken())
                .invitationTitle(domain.getInvitationTitle())
                .invitationDate(domain.getInvitationDate())
                .invitationLocation(domain.getInvitationLocation())
                .mealType(domain.getMealType())
                .build();
    }
}
