package com.example.eventmanager.domain.model;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class InvitationTemplate {
    private Long id;
    private String name;
    private String subject;
    private String content;

    public void updateTemplate(String name, String subject, String content) {
        this.name = name;
        this.subject = subject;
        this.content = content;
    }
}
