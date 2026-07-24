package com.example.eventmanager.domain.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class Caterer {
    private Long id;
    private String businessName;
    private String email;
    private String password;
    private String stripeCustomerId;
    private CatererStatus accountStatus;
    private CatererRole role;
    private String subscriptionPlan;
    private String subscriptionStatus;
    private java.time.LocalDateTime subscriptionStartDate;
    private java.time.LocalDateTime subscriptionEndDate;

    // Méthodes métiers (Règles du domaine)
    public void updateSubscription(String plan, String status) {
        this.subscriptionPlan = plan;
        this.subscriptionStatus = status;
    }

    public void updateSubscription(String plan, String status, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        this.subscriptionPlan = plan;
        this.subscriptionStatus = status;
        this.subscriptionStartDate = startDate;
        this.subscriptionEndDate = endDate;
    }

    public void suspendAccount() {
        this.accountStatus = CatererStatus.SUSPENDED;
    }

    public void activateAccount() {
        this.accountStatus = CatererStatus.APPROVED;
    }

    public void pendAccount() {
        this.accountStatus = CatererStatus.PENDING;
    }

    public boolean isActive() {
        return CatererStatus.APPROVED.equals(this.accountStatus);
    }

    public void updateBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public void updatePassword(String encodedPassword) {
        this.password = encodedPassword;
    }
}
