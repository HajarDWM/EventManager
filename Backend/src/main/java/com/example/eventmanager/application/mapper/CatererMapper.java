package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.domain.model.Caterer;
import com.example.eventmanager.domain.model.CatererStatus;
import org.springframework.stereotype.Component;

@Component
public class CatererMapper {

    public CatererDTO toDTO(Caterer domain) {
        if (domain == null) {
            return null;
        }

        return CatererDTO.builder()
                .id(domain.getId())
                .businessName(domain.getBusinessName())
                .email(domain.getEmail())
                .password(domain.getPassword())
                .stripeCustomerId(domain.getStripeCustomerId())
                .accountStatus(domain.getAccountStatus() != null ? domain.getAccountStatus().name() : null)
                .build();
    }

    public Caterer toDomain(CatererDTO dto) {
        if (dto == null) {
            return null;
        }

        return Caterer.builder()
                .id(dto.getId())
                .businessName(dto.getBusinessName())
                .email(dto.getEmail())
                .password(dto.getPassword())
                .stripeCustomerId(dto.getStripeCustomerId())
                .accountStatus(dto.getAccountStatus() != null ? CatererStatus.valueOf(dto.getAccountStatus()) : CatererStatus.ACTIVE)
                .build();
    }
}

