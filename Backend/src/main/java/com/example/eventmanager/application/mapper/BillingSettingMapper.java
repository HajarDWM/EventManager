package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.BillingSettingDTO;
import com.example.eventmanager.domain.model.BillingSetting;
import org.springframework.stereotype.Component;

@Component
public class BillingSettingMapper {

    public BillingSettingDTO toDTO(BillingSetting domain) {
        if (domain == null) {
            return null;
        }
        return BillingSettingDTO.builder()
                .id(domain.getId())
                .vatRate(domain.getVatRate())
                .currency(domain.getCurrency())
                .subscriptionPriceStandard(domain.getSubscriptionPriceStandard())
                .subscriptionPricePremium(domain.getSubscriptionPricePremium())
                .billingContactEmail(domain.getBillingContactEmail())
                .build();
    }

    public BillingSetting toDomain(BillingSettingDTO dto) {
        if (dto == null) {
            return null;
        }
        return BillingSetting.builder()
                .id(dto.getId())
                .vatRate(dto.getVatRate())
                .currency(dto.getCurrency())
                .subscriptionPriceStandard(dto.getSubscriptionPriceStandard())
                .subscriptionPricePremium(dto.getSubscriptionPricePremium())
                .billingContactEmail(dto.getBillingContactEmail())
                .build();
    }
}
