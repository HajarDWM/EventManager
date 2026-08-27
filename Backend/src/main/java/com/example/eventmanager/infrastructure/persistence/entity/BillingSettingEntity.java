package com.example.eventmanager.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "billing_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BillingSettingEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    @Column(name = "vat_rate", nullable = false)
    private Double vatRate = 20.0;

    @Builder.Default
    @Column(nullable = false)
    private String currency = "EUR";

    @Builder.Default
    @Column(name = "subscription_price_standard", nullable = false)
    private Double subscriptionPriceStandard = 29.90;

    @Builder.Default
    @Column(name = "subscription_price_premium", nullable = false)
    private Double subscriptionPricePremium = 59.90;

    @Builder.Default
    @Column(name = "billing_contact_email", nullable = false)
    private String billingContactEmail = "billing@eventmanager.com";

    @Builder.Default
    @Column(name = "grace_period_days", nullable = false)
    private Integer gracePeriodDays = 10;
}
