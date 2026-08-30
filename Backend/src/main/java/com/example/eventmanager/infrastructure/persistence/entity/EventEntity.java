package com.example.eventmanager.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "event_date", nullable = false)
    private LocalDateTime eventDate;

    private String location;

    @Column(name = "location_map_url", length = 1024)
    private String locationMapUrl;

    @Column(name = "guest_count")
    private Integer guestCount;

    @Column(nullable = false)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "caterer_id", nullable = false)
    private Long catererId;

    @Column(nullable = false)
    @Builder.Default
    private boolean archived = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "digital_template_id")
    private Long digitalTemplateId;

    @Column(name = "template_id")
    private String templateId;

    @Column(name = "invitation_token")
    private String invitationToken;

    @Column(name = "invitation_title")
    private String invitationTitle;

    @Column(name = "invitation_subtitle")
    private String invitationSubtitle;

    @Column(name = "invitation_date")
    private LocalDateTime invitationDate;

    @Column(name = "invitation_location")
    private String invitationLocation;

    @Column(name = "parking_location")
    private String parkingLocation;

    @Column(name = "meal_type", nullable = false)
    @Builder.Default
    private String mealType = "PLATS_FIXES";

    @Column(name = "is_paid_event", nullable = false)
    @Builder.Default
    private boolean isPaidEvent = false;

    @Column(name = "ticket_price")
    @Builder.Default
    private Double ticketPrice = 0.0;

    @Column(name = "currency")
    @Builder.Default
    private String currency = "MAD";
}

