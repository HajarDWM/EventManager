package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.port.out.InvitationTemplateRepositoryPort;
import com.example.eventmanager.domain.model.InvitationTemplate;
import com.example.eventmanager.infrastructure.persistence.entity.InvitationTemplateEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.InvitationTemplatePersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.InvitationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class InvitationTemplateRepositoryAdapter implements InvitationTemplateRepositoryPort {

    private final InvitationTemplateRepository repository;
    private final InvitationTemplatePersistenceMapper mapper;

    @Override
    public InvitationTemplate save(InvitationTemplate template) {
        InvitationTemplateEntity entity = mapper.toEntity(template);
        InvitationTemplateEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<InvitationTemplate> findById(Long id) {
        return repository.findById(id).map(mapper::toDomain);
    }

    @Override
    public List<InvitationTemplate> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Long id) {
        repository.deleteById(id);
    }
}
