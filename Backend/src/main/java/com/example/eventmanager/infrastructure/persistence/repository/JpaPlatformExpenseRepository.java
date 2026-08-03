package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.PlatformExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;

public interface JpaPlatformExpenseRepository extends JpaRepository<PlatformExpenseEntity, Long> {
    List<PlatformExpenseEntity> findByExpenseDateAfterOrderByExpenseDateDesc(LocalDateTime date);
    List<PlatformExpenseEntity> findAllByOrderByExpenseDateDesc();
}
