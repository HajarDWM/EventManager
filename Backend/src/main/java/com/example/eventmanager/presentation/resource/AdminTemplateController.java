package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.infrastructure.persistence.entity.DigitalInvitationTemplateEntity;
import com.example.eventmanager.infrastructure.persistence.repository.DigitalInvitationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/templates")
@RequiredArgsConstructor
public class AdminTemplateController {

    private final DigitalInvitationTemplateRepository repository;

    @GetMapping
    public ResponseEntity<List<DigitalInvitationTemplateEntity>> getAllTemplates() {
        return ResponseEntity.ok(repository.findAll());
    }

    @PostMapping
    public ResponseEntity<DigitalInvitationTemplateEntity> createTemplate(@RequestBody DigitalInvitationTemplateEntity template) {
        // Set defaults if empty
        if (template.getImageUrl() == null || template.getImageUrl().isBlank()) {
            template.setImageUrl("https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500");
        }
        if (template.getTemplateKey() == null || template.getTemplateKey().isBlank()) {
            template.setTemplateKey(generateTemplateKey(template.getTitle(), template.getCategory()));
        }
        if (template.getDecorativeFrame() == null || template.getDecorativeFrame().isBlank()) {
            template.setDecorativeFrame("Mariage".equalsIgnoreCase(template.getCategory()) ? "floral-frame" : "geometric-frame");
        }
        if (template.getAccentColor() == null || template.getAccentColor().isBlank()) {
            template.setAccentColor("#d4af37");
        }
        if (template.getBackgroundColor() == null || template.getBackgroundColor().isBlank()) {
            template.setBackgroundColor("Mariage".equalsIgnoreCase(template.getCategory()) ? "#faf6ee" : "#f8f9fa");
        }
        if (template.getPrimaryFont() == null || template.getPrimaryFont().isBlank()) {
            template.setPrimaryFont("Mariage".equalsIgnoreCase(template.getCategory()) ? "Alex Brush" : "Playfair Display");
        }
        if (template.getPrimaryFontSize() == null || template.getPrimaryFontSize().isBlank()) {
            template.setPrimaryFontSize("36px");
        }
        if (template.getPrimaryFontWeight() == null || template.getPrimaryFontWeight().isBlank()) {
            template.setPrimaryFontWeight("700");
        }
        if (template.getPrimaryLetterSpacing() == null || template.getPrimaryLetterSpacing().isBlank()) {
            template.setPrimaryLetterSpacing("normal");
        }
        if (template.getSecondaryFont() == null || template.getSecondaryFont().isBlank()) {
            template.setSecondaryFont("Mariage".equalsIgnoreCase(template.getCategory()) ? "Cinzel" : "Montserrat");
        }
        if (template.getSecondaryFontSize() == null || template.getSecondaryFontSize().isBlank()) {
            template.setSecondaryFontSize("16px");
        }
        if (template.getSecondaryFontWeight() == null || template.getSecondaryFontWeight().isBlank()) {
            template.setSecondaryFontWeight("400");
        }
        if (template.getSecondaryLetterSpacing() == null || template.getSecondaryLetterSpacing().isBlank()) {
            template.setSecondaryLetterSpacing("normal");
        }
        if (template.getSecondaryFontColor() == null || template.getSecondaryFontColor().isBlank()) {
            template.setSecondaryFontColor("Mariage".equalsIgnoreCase(template.getCategory()) ? "#0f172a" : "#1e293b");
        }
        if (template.getHtmlContent() == null || template.getHtmlContent().isBlank()) {
            template.setHtmlContent("<h1>" + template.getTitle() + "</h1><p>" + template.getDescription() + "</p>");
        }
        if (template.getOpeningAnimation() == null || template.getOpeningAnimation().isBlank()) {
            template.setOpeningAnimation("envelope-wax");
        }
        if (template.getVisualParticles() == null || template.getVisualParticles().isBlank()) {
            template.setVisualParticles("gold-dust");
        }
        if (template.getBackgroundMotion() == null || template.getBackgroundMotion().isBlank()) {
            template.setBackgroundMotion("ken-burns");
        }
        if (template.getContentEntrance() == null || template.getContentEntrance().isBlank()) {
            template.setContentEntrance("staggered-royal");
        }
        if (template.getShowCountdown() == null) {
            template.setShowCountdown(true);
        }
        if (template.getShowCalendarButton() == null) {
            template.setShowCalendarButton(true);
        }
        if (template.getShowMapRoute() == null) {
            template.setShowMapRoute(true);
        }
        DigitalInvitationTemplateEntity saved = repository.save(template);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DigitalInvitationTemplateEntity> updateTemplate(@PathVariable Long id, @RequestBody DigitalInvitationTemplateEntity updated) {
        return repository.findById(id).map(existing -> {
            if (updated.getTitle() != null && !updated.getTitle().isBlank()) {
                existing.setTitle(updated.getTitle());
            }
            if (updated.getCategory() != null && !updated.getCategory().isBlank()) {
                existing.setCategory(updated.getCategory());
            }
            if (updated.getSubCategory() != null) {
                existing.setSubCategory(updated.getSubCategory());
            }
            if (updated.getDescription() != null) {
                existing.setDescription(updated.getDescription());
            }
            existing.setImageUrl(updated.getImageUrl() != null && !updated.getImageUrl().isBlank() ? updated.getImageUrl().trim() : null);
            if (updated.getTemplateKey() != null && !updated.getTemplateKey().isBlank()) {
                existing.setTemplateKey(updated.getTemplateKey());
            }
            if (updated.getDecorativeFrame() != null) {
                existing.setDecorativeFrame(updated.getDecorativeFrame());
            }
            if (updated.getAccentColor() != null) {
                existing.setAccentColor(updated.getAccentColor());
            }
            if (updated.getBackgroundColor() != null) {
                existing.setBackgroundColor(updated.getBackgroundColor());
            }
            // Allow clearing background image
            existing.setBackgroundImageUrl(
                (updated.getBackgroundImageUrl() != null && !updated.getBackgroundImageUrl().isBlank())
                    ? updated.getBackgroundImageUrl().trim()
                    : null
            );
            existing.setBackgroundImageDesktopUrl(
                (updated.getBackgroundImageDesktopUrl() != null && !updated.getBackgroundImageDesktopUrl().isBlank())
                    ? updated.getBackgroundImageDesktopUrl().trim()
                    : null
            );
            if (updated.getPrimaryFont() != null) {
                existing.setPrimaryFont(updated.getPrimaryFont());
            }
            if (updated.getPrimaryFontSize() != null) {
                existing.setPrimaryFontSize(updated.getPrimaryFontSize());
            }
            if (updated.getPrimaryFontWeight() != null) {
                existing.setPrimaryFontWeight(updated.getPrimaryFontWeight());
            }
            if (updated.getPrimaryLetterSpacing() != null) {
                existing.setPrimaryLetterSpacing(updated.getPrimaryLetterSpacing());
            }
            if (updated.getSecondaryFont() != null) {
                existing.setSecondaryFont(updated.getSecondaryFont());
            }
            if (updated.getSecondaryFontSize() != null) {
                existing.setSecondaryFontSize(updated.getSecondaryFontSize());
            }
            if (updated.getSecondaryFontWeight() != null) {
                existing.setSecondaryFontWeight(updated.getSecondaryFontWeight());
            }
            if (updated.getSecondaryLetterSpacing() != null) {
                existing.setSecondaryLetterSpacing(updated.getSecondaryLetterSpacing());
            }
            if (updated.getSecondaryFontColor() != null) {
                existing.setSecondaryFontColor(updated.getSecondaryFontColor());
            }
            existing.setHtmlContent(updated.getHtmlContent() != null && !updated.getHtmlContent().isBlank() ? updated.getHtmlContent().trim() : null);
            // Allow clearing music audio
            existing.setMusicUrl(
                (updated.getMusicUrl() != null && !updated.getMusicUrl().isBlank())
                    ? updated.getMusicUrl().trim()
                    : null
            );
            if (updated.getOpeningAnimation() != null) {
                existing.setOpeningAnimation(updated.getOpeningAnimation());
            }
            if (updated.getVisualParticles() != null) {
                existing.setVisualParticles(updated.getVisualParticles());
            }
            if (updated.getBackgroundMotion() != null) {
                existing.setBackgroundMotion(updated.getBackgroundMotion());
            }
            if (updated.getContentEntrance() != null) {
                existing.setContentEntrance(updated.getContentEntrance());
            }
            if (updated.getShowCountdown() != null) {
                existing.setShowCountdown(updated.getShowCountdown());
            }
            if (updated.getShowCalendarButton() != null) {
                existing.setShowCalendarButton(updated.getShowCalendarButton());
            }
            if (updated.getShowMapRoute() != null) {
                existing.setShowMapRoute(updated.getShowMapRoute());
            }
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private String generateTemplateKey(String title, String category) {
        if (title == null) return "custom-theme";
        String normalized = title.toLowerCase()
                .replace(" ", "-")
                .replace("&", "et")
                .replace("é", "e")
                .replace("è", "e")
                .replace("ê", "e")
                .replace("à", "a")
                .replaceAll("[^a-z0-9\\-]", "");
        return normalized.isBlank() ? ("Mariage".equalsIgnoreCase(category) ? "fleurs-de-coton" : "corporate-professional") : normalized;
    }
}
