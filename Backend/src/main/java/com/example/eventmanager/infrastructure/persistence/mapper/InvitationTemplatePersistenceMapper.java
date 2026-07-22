package com.example.eventmanager.infrastructure.persistence.mapper;

import com.example.eventmanager.domain.model.InvitationTemplate;
import com.example.eventmanager.infrastructure.persistence.entity.InvitationTemplateEntity;
import org.springframework.stereotype.Component;

@Component
public class InvitationTemplatePersistenceMapper {

    public InvitationTemplateEntity toEntity(InvitationTemplate domain) {
        if (domain == null) {
            return null;
        }
        return InvitationTemplateEntity.builder()
                .id(domain.getId())
                .name(domain.getName())
                .subject(domain.getSubject())
                .content(domain.getContent())
                .build();
    }

    public InvitationTemplate toDomain(InvitationTemplateEntity entity) {
        if (entity == null) {
            return null;
        }
        return InvitationTemplate.builder()
                .id(entity.getId())
                .name(entity.getName())
                .subject(entity.getSubject())
                .content(entity.getContent())
                .build();
    }
}
