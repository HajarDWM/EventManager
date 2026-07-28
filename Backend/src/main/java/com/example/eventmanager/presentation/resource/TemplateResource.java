package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.infrastructure.persistence.entity.DigitalInvitationTemplateEntity;
import com.example.eventmanager.infrastructure.persistence.repository.DigitalInvitationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/templates")
@RequiredArgsConstructor
public class TemplateResource {

    private final DigitalInvitationTemplateRepository repository;

    @GetMapping
    public ResponseEntity<List<DigitalInvitationTemplateEntity>> getAllTemplates() {
        return ResponseEntity.ok(repository.findAll());
    }
}
