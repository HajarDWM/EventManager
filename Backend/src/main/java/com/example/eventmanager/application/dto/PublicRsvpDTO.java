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
    private String locationMapUrl;
    
    private Long digitalTemplateId;
    private String invitationTitle;
    private String invitationSubtitle;
    private LocalDateTime invitationDate;
    private String invitationLocation;
    private String parkingLocation;
    private String mealType;
    private String templateCategory; // Mariage, Corporate, etc.
    private String templateSubCategory;
    private String templateId;
    private String templateTitle;
    private String decorativeFrame; // floral-frame, gold-border, geometric-frame, minimal-edge
    private String accentColor;
    private String backgroundColor;
    private String templateBackgroundImageUrl;
    private String templateBackgroundImageDesktopUrl;
    private String primaryFont;
    private String primaryFontSize;
    private String primaryFontWeight;
    private String primaryLetterSpacing;
    private String secondaryFont;
    private String secondaryFontSize;
    private String secondaryFontWeight;
    private String secondaryLetterSpacing;
    private String secondaryFontColor;
    private String templateMusicUrl;
    private String openingAnimation;
    private String visualParticles;
    private String backgroundMotion;
    private String contentEntrance;
    private Boolean showCountdown;
    private Boolean showCalendarButton;
    private Boolean showMapRoute;
    private java.util.List<MenuItemDTO> menuItems;

    private Boolean isPaidEvent;
    private Double ticketPrice;
    private String currency;
    private String paymentStatus;
    private Double paidAmount;
    private String paymentReference;
    private LocalDateTime paymentDate;
}
