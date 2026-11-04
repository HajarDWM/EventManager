package com.example.eventmanager.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExpressInvitationRequestDTO {
    private String title;
    private String eventType;
    private String eventDate;
    private String location;
    private String locationMapUrl;
    private String invitationSubtitle;
    private Long digitalTemplateId;
}

