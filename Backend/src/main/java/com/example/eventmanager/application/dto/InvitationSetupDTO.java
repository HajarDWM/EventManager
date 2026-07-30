package com.example.eventmanager.application.dto;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvitationSetupDTO {
    private Long templateId;
    private String templateIdString;
    private String invitationTitle;
    private LocalDateTime invitationDate;
    private String invitationLocation;
    private String invitationToken;
}
