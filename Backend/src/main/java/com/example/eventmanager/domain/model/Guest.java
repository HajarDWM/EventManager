package com.example.eventmanager.domain.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
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
    private String groupName;
    @Builder.Default
    private String paymentStatus = "NOT_REQUIRED";
    @Builder.Default
    private Double paidAmount = 0.0;
    private String paymentReference;
    private java.time.LocalDateTime paymentDate;

    public void updateDetails(String fullName, String email, String phone, GuestStatus status, String tableNumber, String dietaryRequirements, String groupName) {
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        if (status != null) {
            this.status = status;
        }
        this.tableNumber = tableNumber;
        this.dietaryRequirements = dietaryRequirements;
        this.groupName = groupName;
    }

    public void recordPayment(Double amount, String reference) {
        this.paidAmount = amount;
        this.paymentReference = reference;
        this.paymentDate = java.time.LocalDateTime.now();
        this.paymentStatus = "PAID";
        this.status = GuestStatus.CONFIRMED;
    }
}
