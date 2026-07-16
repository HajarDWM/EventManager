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

    // Méthodes métiers (Règles du domaine)
    public void suspendAccount() {
        this.accountStatus = CatererStatus.SUSPENDED;
    }

    public void activateAccount() {
        this.accountStatus = CatererStatus.ACTIVE;
    }

    public boolean isActive() {
        return CatererStatus.ACTIVE.equals(this.accountStatus);
    }
}
