package com.example.eventmanager.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpressInvitationResponseDTO {
    private Long eventId;
    private String eventToken;
    private String title;
    private String eventDate;
    private String location;
    private String locationMapUrl;
    private String invitationSubtitle;
    private Long digitalTemplateId;
    private String templateTitle;
    private String generalInviteLink;
    private List<ExpressGuestResponseDTO> guests;
}

