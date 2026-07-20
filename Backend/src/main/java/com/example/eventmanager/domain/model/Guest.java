package com.example.eventmanager.domain.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class Guest {
    private Long id;
    private Long eventId;
    private String fullName;
    private String email;
    private String phone;
    private GuestStatus status;
    private String tableNumber;
    private String dietaryRequirements;

    public void updateDetails(String fullName, String email, String phone, GuestStatus status, String tableNumber, String dietaryRequirements) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        if (status != null) {
            this.status = status;
        }
        this.tableNumber = tableNumber;
        this.dietaryRequirements = dietaryRequirements;
    }
}
