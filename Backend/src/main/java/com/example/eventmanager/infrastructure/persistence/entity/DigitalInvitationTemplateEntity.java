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

    @Column(name = "sub_category", length = 100)
    private String subCategory;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "image_url", columnDefinition = "LONGTEXT")
    private String imageUrl;

    @Column(name = "template_key")
    private String templateKey;

    @Column(name = "decorative_frame")
    private String decorativeFrame;

    @Column(name = "accent_color", length = 50)
    private String accentColor;

    @Column(name = "background_color", length = 50)
    private String backgroundColor;

    @Column(name = "background_image_url", columnDefinition = "LONGTEXT")
    private String backgroundImageUrl;

    @Column(name = "primary_font", length = 100)
    private String primaryFont;

    @Column(name = "primary_font_size", length = 30)
    private String primaryFontSize;

    @Column(name = "secondary_font", length = 100)
    private String secondaryFont;

    @Column(name = "secondary_font_size", length = 30)
    private String secondaryFontSize;

    @Column(name = "secondary_font_color", length = 50)
    private String secondaryFontColor;

    @Column(name = "html_content", columnDefinition = "LONGTEXT")
    private String htmlContent;

    @Column(name = "music_url", columnDefinition = "LONGTEXT")
    private String musicUrl;
}
