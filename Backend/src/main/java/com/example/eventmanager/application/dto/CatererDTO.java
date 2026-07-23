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
public class CatererDTO {

    private Long id;

    private String businessName;

    private String email;

    private String password;

    private String stripeCustomerId;

    private String accountStatus;

    private String role;

    private String subscriptionPlan;

    private String subscriptionStatus;

    private java.time.LocalDateTime subscriptionStartDate;

    private java.time.LocalDateTime subscriptionEndDate;

    private Integer eventCount;

    private Integer eventLimit;

    private Long subscriptionRemainingDays;
}

