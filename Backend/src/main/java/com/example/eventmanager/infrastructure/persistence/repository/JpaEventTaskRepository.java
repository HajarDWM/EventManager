package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.EventTaskEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JpaEventTaskRepository extends JpaRepository<EventTaskEntity, Long> {
    List<EventTaskEntity> findByEventId(Long eventId);
    void deleteByEventId(Long eventId);
}
