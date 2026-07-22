package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.InvitationTemplate;

import java.util.List;
import java.util.Optional;

public interface InvitationTemplateRepositoryPort {
    InvitationTemplate save(InvitationTemplate template);
    Optional<InvitationTemplate> findById(Long id);
    List<InvitationTemplate> findAll();
    void deleteById(Long id);
}
