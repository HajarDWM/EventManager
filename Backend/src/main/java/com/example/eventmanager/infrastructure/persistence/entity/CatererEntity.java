package com.example.eventmanager.infrastructure.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "caterers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode
public class CatererEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "stripe_customer_id")
    private String stripeCustomerId;

    @Builder.Default
    @Column(name = "account_status", nullable = false)
    private String accountStatus = "PENDING";

    @Builder.Default
    @Column(name = "role", nullable = false)
    private String role = "TRAITEUR";

    @Builder.Default
    @Column(name = "subscription_plan", nullable = false)
    private String subscriptionPlan = "FREE";

    @Builder.Default
    @Column(name = "subscription_status", nullable = false)
    private String subscriptionStatus = "ACTIVE";

    @Column(name = "subscription_start_date")
    private java.time.LocalDateTime subscriptionStartDate;

    @Column(name = "subscription_end_date")
    private java.time.LocalDateTime subscriptionEndDate;
}


