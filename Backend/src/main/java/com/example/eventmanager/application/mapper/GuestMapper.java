package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.GuestDTO;
import com.example.eventmanager.domain.model.Guest;
import com.example.eventmanager.infrastructure.persistence.entity.GuestEntity;
import org.springframework.stereotype.Component;

@Component
public class GuestMapper {

    public Guest toDomain(GuestDTO dto) {
        if (dto == null) return null;
        return Guest.builder()
                .id(dto.getId())
                .eventId(dto.getEventId())
                .fullName(dto.getFullName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .status(dto.getStatus())
                .tableNumber(dto.getTableNumber())
                .dietaryRequirements(dto.getDietaryRequirements())
                .groupName(dto.getGroupName())
                .build();
    }

    public GuestDTO toDTO(Guest domain) {
        if (domain == null) return null;
        return GuestDTO.builder()
                .id(domain.getId())
                .eventId(domain.getEventId())
                .fullName(domain.getFullName())
                .email(domain.getEmail())
                .phone(domain.getPhone())
                .status(domain.getStatus())
                .tableNumber(domain.getTableNumber())
                .dietaryRequirements(domain.getDietaryRequirements())
                .groupName(domain.getGroupName())
                .build();
    }

    public GuestEntity toEntity(Guest domain) {
        if (domain == null) return null;
        GuestEntity entity = new GuestEntity();
        entity.setId(domain.getId());
        entity.setEventId(domain.getEventId());
        entity.setFullName(domain.getFullName());
        entity.setEmail(domain.getEmail());
        entity.setPhone(domain.getPhone());
        entity.setStatus(domain.getStatus() != null ? domain.getStatus().name() : "PENDING");
        entity.setTableNumber(domain.getTableNumber());
        entity.setDietaryRequirements(domain.getDietaryRequirements());
        entity.setGroupName(domain.getGroupName());
        return entity;
    }

    public Guest toDomainFromEntity(GuestEntity entity) {
        if (entity == null) return null;
        return Guest.builder()
                .id(entity.getId())
                .eventId(entity.getEventId())
                .fullName(entity.getFullName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .status(entity.getStatus() != null ? com.example.eventmanager.domain.model.GuestStatus.valueOf(entity.getStatus()) : com.example.eventmanager.domain.model.GuestStatus.PENDING)
                .tableNumber(entity.getTableNumber())
                .dietaryRequirements(entity.getDietaryRequirements())
                .groupName(entity.getGroupName())
                .build();
    }
}
