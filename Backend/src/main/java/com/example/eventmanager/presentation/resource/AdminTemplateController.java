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
        // Set default imageUrl and htmlContent if empty/null for visual template previews
        if (template.getImageUrl() == null || template.getImageUrl().isBlank()) {
            template.setImageUrl("https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500");
        }
        if (template.getHtmlContent() == null || template.getHtmlContent().isBlank()) {
            template.setHtmlContent("<h1>" + template.getTitle() + "</h1><p>" + template.getDescription() + "</p>");
        }
        DigitalInvitationTemplateEntity saved = repository.save(template);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
