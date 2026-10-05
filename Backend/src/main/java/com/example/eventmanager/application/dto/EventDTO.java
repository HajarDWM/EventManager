package com.example.eventmanager.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {
    private Long id;
    private String title;
    private LocalDateTime eventDate;
    private String location;
    private String locationMapUrl;
    private Integer guestCount;
    private String status;
    private Long catererId;
    private String catererName;
    private String catererEmail;
    private Long clientId;
    private String clientName;
    private String clientEmail;
    private String clientPhone;
    private String accessLinkToken;
    private LocalDateTime accessLinkExpiresAt;
    private LocalDateTime createdAt;
    private Long digitalTemplateId;
    private String templateId;
    private String invitationToken;
    private String invitationTitle;
    private String invitationSubtitle;
    private LocalDateTime invitationDate;
    private String invitationLocation;
    private String parkingLocation;
    private String mealType;
    private Boolean isPaidEvent;
    private Double ticketPrice;
    private String currency;
    private Double totalContractAmount;
    private Double depositsPaid;
    private Double balanceDue;
    private String templateBackgroundImageUrl;
    private String tableShape;
    private Integer tableCapacity;
    private Integer tablesCount;
}
