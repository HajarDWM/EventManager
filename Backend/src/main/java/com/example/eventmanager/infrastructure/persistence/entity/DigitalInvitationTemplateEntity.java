package com.example.eventmanager.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "digital_invitation_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DigitalInvitationTemplateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", length = 2000)
    private String imageUrl;

    @Column(name = "html_content", columnDefinition = "TEXT")
    private String htmlContent;
}
