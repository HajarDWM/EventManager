package com.example.eventmanager.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpressGuestResponseDTO {
    private Long id;
    private Long eventId;
    private String fullName;
    private String phone;
    private String status;
    private String invitationToken;
    private String rsvpLink;
    private String whatsappShareUrl;
}

