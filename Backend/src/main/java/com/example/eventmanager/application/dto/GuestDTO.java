package com.example.eventmanager.application.dto;

import com.example.eventmanager.domain.model.GuestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuestDTO {
    private Long id;
    private Long eventId;
    private String fullName;
    private String email;
    private String phone;
    private GuestStatus status;
    private String tableNumber;
    private String dietaryRequirements;
    private String groupName;
    private String paymentStatus;
    private Double paidAmount;
    private String paymentReference;
    private java.time.LocalDateTime paymentDate;
}
