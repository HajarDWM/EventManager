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
        if (template.getSecondaryFont() == null || template.getSecondaryFont().isBlank()) {
            template.setSecondaryFont("Mariage".equalsIgnoreCase(template.getCategory()) ? "Cinzel" : "Montserrat");
        }
        if (template.getSecondaryFontColor() == null || template.getSecondaryFontColor().isBlank()) {
            template.setSecondaryFontColor("Mariage".equalsIgnoreCase(template.getCategory()) ? "#0f172a" : "#1e293b");
        }
        if (template.getHtmlContent() == null || template.getHtmlContent().isBlank()) {
            template.setHtmlContent("<h1>" + template.getTitle() + "</h1><p>" + template.getDescription() + "</p>");
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
            if (updated.getDescription() != null) {
                existing.setDescription(updated.getDescription());
            }
            if (updated.getImageUrl() != null) {
                existing.setImageUrl(updated.getImageUrl());
            }
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
            if (updated.getBackgroundImageUrl() != null) {
                existing.setBackgroundImageUrl(updated.getBackgroundImageUrl());
            }
            if (updated.getPrimaryFont() != null) {
                existing.setPrimaryFont(updated.getPrimaryFont());
            }
            if (updated.getSecondaryFont() != null) {
                existing.setSecondaryFont(updated.getSecondaryFont());
            }
            if (updated.getSecondaryFontColor() != null) {
                existing.setSecondaryFontColor(updated.getSecondaryFontColor());
            }
            if (updated.getHtmlContent() != null) {
                existing.setHtmlContent(updated.getHtmlContent());
            }
            if (updated.getMusicUrl() != null) {
                existing.setMusicUrl(updated.getMusicUrl());
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
