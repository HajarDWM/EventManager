package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.EventExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JpaEventExpenseRepository extends JpaRepository<EventExpenseEntity, Long> {
    List<EventExpenseEntity> findByEventIdOrderByExpenseDateDesc(Long eventId);
}
