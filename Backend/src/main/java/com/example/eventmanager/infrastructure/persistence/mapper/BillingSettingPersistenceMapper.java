package com.example.eventmanager.infrastructure.persistence.mapper;

import com.example.eventmanager.domain.model.BillingSetting;
import com.example.eventmanager.infrastructure.persistence.entity.BillingSettingEntity;
import org.springframework.stereotype.Component;

@Component
public class BillingSettingPersistenceMapper {

    public BillingSettingEntity toEntity(BillingSetting domain) {
        if (domain == null) {
            return null;
        }
        return BillingSettingEntity.builder()
                .id(domain.getId())
                .vatRate(domain.getVatRate())
                .currency(domain.getCurrency())
                .subscriptionPriceStandard(domain.getSubscriptionPriceStandard())
                .subscriptionPricePremium(domain.getSubscriptionPricePremium())
                .billingContactEmail(domain.getBillingContactEmail())
                .gracePeriodDays(domain.getGracePeriodDays() != null ? domain.getGracePeriodDays() : 10)
                .build();
    }

    public BillingSetting toDomain(BillingSettingEntity entity) {
        if (entity == null) {
            return null;
        }
        return BillingSetting.builder()
                .id(entity.getId())
                .vatRate(entity.getVatRate())
                .currency(entity.getCurrency())
                .subscriptionPriceStandard(entity.getSubscriptionPriceStandard())
                .subscriptionPricePremium(entity.getSubscriptionPricePremium())
                .billingContactEmail(entity.getBillingContactEmail())
                .gracePeriodDays(entity.getGracePeriodDays() != null ? entity.getGracePeriodDays() : 10)
                .build();
    }
}
