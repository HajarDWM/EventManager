package com.example.eventmanager.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingSettingDTO {
    private Long id;
    private Double vatRate;
    private String currency;
    private Double subscriptionPriceStandard;
    private Double subscriptionPricePremium;
    private String billingContactEmail;
}
