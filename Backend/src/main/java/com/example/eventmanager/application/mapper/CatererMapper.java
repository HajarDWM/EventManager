package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.infrastructure.persistence.entity.CatererEntity;
import org.springframework.stereotype.Component;

@Component
public class CatererMapper {

    public CatererDTO toDTO(CatererEntity entity) {
        if (entity == null) {
            return null;
        }

        return CatererDTO.builder()
                .id(entity.getId())
                .businessName(entity.getBusinessName())
                .email(entity.getEmail())
                .password(entity.getPassword())
                .stripeCustomerId(entity.getStripeCustomerId())
                .accountStatus(entity.getAccountStatus())
                .build();
    }

    public CatererEntity toEntity(CatererDTO dto) {
        if (dto == null) {
            return null;
        }

        return CatererEntity.builder()
                .id(dto.getId())
                .businessName(dto.getBusinessName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .stripeCustomerId(dto.getStripeCustomerId())
                .accountStatus(dto.getAccountStatus() != null ? dto.getAccountStatus() : "ACTIVE")
                .build();
    }

    public void updateEntityFromDTO(CatererDTO dto, CatererEntity entity) {
        if (dto == null || entity == null) {
            return;
        }

        entity.setBusinessName(dto.getBusinessName());
        entity.setEmail(dto.getEmail());
        entity.setPassword(dto.getPassword());
        entity.setStripeCustomerId(dto.getStripeCustomerId());
        if (dto.getAccountStatus() != null) {
            entity.setAccountStatus(dto.getAccountStatus());
        }
    }
}

