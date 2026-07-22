package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.InvitationTemplateDTO;

import java.util.List;

public interface AdminInvitationTemplateUseCase {
    List<InvitationTemplateDTO> getAllTemplates();
    InvitationTemplateDTO getTemplateById(Long id);
    InvitationTemplateDTO createTemplate(InvitationTemplateDTO dto);
    InvitationTemplateDTO updateTemplate(Long id, InvitationTemplateDTO dto);
    void deleteTemplate(Long id);
}
