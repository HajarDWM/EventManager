package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.EventEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<EventEntity, Long> {
    List<EventEntity> findByCatererId(Long catererId);
    List<EventEntity> findByClientId(Long clientId);
    List<EventEntity> findByCatererIdAndArchivedFalse(Long catererId);
    List<EventEntity> findByArchivedFalse();
    Optional<EventEntity> findByIdAndArchivedFalse(Long id);
    long countByCatererId(Long catererId);
    long countByCatererIdAndArchivedFalse(Long catererId);
    long countByCatererIdAndCreatedAtAfter(Long catererId, java.time.LocalDateTime createdAt);
}
