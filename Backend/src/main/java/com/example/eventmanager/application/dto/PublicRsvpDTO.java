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
    private java.util.List<MenuItemDTO> menuItems;
}
