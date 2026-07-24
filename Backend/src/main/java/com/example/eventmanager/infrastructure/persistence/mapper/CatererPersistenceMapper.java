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
                .accountStatus(domain.getAccountStatus() != null ? domain.getAccountStatus().name() : "PENDING")
                .role(domain.getRole() != null ? domain.getRole().name() : "TRAITEUR")
                .subscriptionPlan(domain.getSubscriptionPlan() != null ? domain.getSubscriptionPlan() : "FREE")
                .subscriptionStatus(domain.getSubscriptionStatus() != null ? domain.getSubscriptionStatus() : "ACTIVE")
                .subscriptionStartDate(domain.getSubscriptionStartDate())
                .subscriptionEndDate(domain.getSubscriptionEndDate())
                .build();
    }

    public Caterer toDomain(CatererEntity entity) {
        if (entity == null) {
            return null;
        }

        CatererStatus status;
        if (entity.getAccountStatus() == null) {
            status = CatererStatus.PENDING;
        } else if ("ACTIVE".equalsIgnoreCase(entity.getAccountStatus()) || "APPROVED".equalsIgnoreCase(entity.getAccountStatus())) {
            status = CatererStatus.APPROVED;
        } else {
            try {
                status = CatererStatus.valueOf(entity.getAccountStatus());
            } catch (IllegalArgumentException e) {
                status = CatererStatus.PENDING;
            }
        }

        return Caterer.builder()
                .id(entity.getId())
                .businessName(entity.getBusinessName())
                .email(entity.getEmail())
                .password(entity.getPassword())
                .stripeCustomerId(entity.getStripeCustomerId())
                .accountStatus(status)
                .role(entity.getRole() != null ? com.example.eventmanager.domain.model.CatererRole.valueOf(entity.getRole()) : com.example.eventmanager.domain.model.CatererRole.TRAITEUR)
                .subscriptionPlan(entity.getSubscriptionPlan() != null ? entity.getSubscriptionPlan() : "FREE")
                .subscriptionStatus(entity.getSubscriptionStatus() != null ? entity.getSubscriptionStatus() : "ACTIVE")
                .subscriptionStartDate(entity.getSubscriptionStartDate())
                .subscriptionEndDate(entity.getSubscriptionEndDate())
                .build();
    }
}
