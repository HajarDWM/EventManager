package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.QuoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuoteRepository extends JpaRepository<QuoteEntity, Long> {
    List<QuoteEntity> findByCatererId(Long catererId);
    List<QuoteEntity> findByEventId(Long eventId);
    Optional<QuoteEntity> findByReference(String reference);
}
