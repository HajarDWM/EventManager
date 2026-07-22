package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.InvitationTemplateDTO;
import com.example.eventmanager.domain.model.InvitationTemplate;
import org.springframework.stereotype.Component;

@Component
public class InvitationTemplateMapper {

    public InvitationTemplateDTO toDTO(InvitationTemplate domain) {
        if (domain == null) {
            return null;
        }
        return InvitationTemplateDTO.builder()
                .id(domain.getId())
                .name(domain.getName())
                .subject(domain.getSubject())
                .content(domain.getContent())
                .build();
    }

    public InvitationTemplate toDomain(InvitationTemplateDTO dto) {
        if (dto == null) {
            return null;
        }
        return InvitationTemplate.builder()
                .id(dto.getId())
                .name(dto.getName())
                .subject(dto.getSubject())
                .content(dto.getContent())
                .build();
    }
}
