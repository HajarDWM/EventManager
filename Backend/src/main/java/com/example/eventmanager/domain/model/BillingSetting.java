package com.example.eventmanager.domain.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class BillingSetting {
    private Long id;
    private Double vatRate;
    private String currency;
    private Double subscriptionPriceStandard;
    private Double subscriptionPricePremium;
    private String billingContactEmail;

    public void updateBilling(Double vatRate, String currency, Double subscriptionPriceStandard, Double subscriptionPricePremium, String billingContactEmail) {
        this.vatRate = vatRate;
        this.currency = currency;
        this.subscriptionPriceStandard = subscriptionPriceStandard;
        this.subscriptionPricePremium = subscriptionPricePremium;
        this.billingContactEmail = billingContactEmail;
    }
}
