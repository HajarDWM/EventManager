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
public class PublicRsvpDTO {
    private Long guestId;
    private String guestName;
    private String guestEmail;
    private String guestPhone;
    private String guestStatus; // PENDING, CONFIRMED, DECLINED
    private String tableNumber;
    private String dietaryRequirements;
    
    private Long eventId;
    private String eventTitle;
    private LocalDateTime eventDate;
    private String eventLocation;
    
    private Long digitalTemplateId;
    private String invitationTitle;
    private LocalDateTime invitationDate;
    private String invitationLocation;
    private String mealType;
    private String templateCategory; // Mariage, Corporate, etc.
    private String templateId;
    private String templateTitle;
    private String decorativeFrame; // floral-frame, gold-border, geometric-frame, minimal-edge
    private String accentColor;
    private String backgroundColor;
    private String templateBackgroundImageUrl;
    private String templateMusicUrl;
    private java.util.List<MenuItemDTO> menuItems;
}
