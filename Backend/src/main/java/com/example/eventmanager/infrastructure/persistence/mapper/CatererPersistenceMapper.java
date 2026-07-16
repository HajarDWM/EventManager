package com.example.eventmanager.infrastructure.persistence.mapper;

import com.example.eventmanager.domain.model.Caterer;
import com.example.eventmanager.domain.model.CatererStatus;
import com.example.eventmanager.infrastructure.persistence.entity.CatererEntity;
import org.springframework.stereotype.Component;

@Component
public class CatererPersistenceMapper {

    public CatererEntity toEntity(Caterer domain) {
        if (domain == null) {
            return null;
        }

        return CatererEntity.builder()
                .id(domain.getId())
                .businessName(domain.getBusinessName())
                .email(domain.getEmail())
                .password(domain.getPassword())
                .stripeCustomerId(domain.getStripeCustomerId())
                .accountStatus(domain.getAccountStatus() != null ? domain.getAccountStatus().name() : "ACTIVE")
                .build();
    }

    public Caterer toDomain(CatererEntity entity) {
        if (entity == null) {
            return null;
        }

        return Caterer.builder()
                .id(entity.getId())
                .businessName(entity.getBusinessName())
                .email(entity.getEmail())
                .password(entity.getPassword())
                .stripeCustomerId(entity.getStripeCustomerId())
                .accountStatus(entity.getAccountStatus() != null ? CatererStatus.valueOf(entity.getAccountStatus()) : CatererStatus.ACTIVE)
                .build();
    }
}
