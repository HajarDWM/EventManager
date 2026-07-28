package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.DigitalInvitationTemplateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DigitalInvitationTemplateRepository extends JpaRepository<DigitalInvitationTemplateEntity, Long> {
}
