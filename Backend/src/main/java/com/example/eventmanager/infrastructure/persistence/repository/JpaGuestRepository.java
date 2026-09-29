package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.GuestEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JpaGuestRepository extends JpaRepository<GuestEntity, Long> {
    List<GuestEntity> findByEventIdOrderByIdDesc(Long eventId);
    List<GuestEntity> findByEventId(Long eventId);
    void deleteByEventId(Long eventId);
    long countByEventId(Long eventId);
    java.util.Optional<GuestEntity> findByInvitationToken(String token);
}
