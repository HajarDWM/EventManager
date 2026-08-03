package com.example.eventmanager.infrastructure.persistence.mapper;

import com.example.eventmanager.domain.model.PlatformExpense;
import com.example.eventmanager.infrastructure.persistence.entity.PlatformExpenseEntity;
import org.springframework.stereotype.Component;

@Component
public class PlatformExpensePersistenceMapper {

    public PlatformExpenseEntity toEntity(PlatformExpense domain) {
        if (domain == null) return null;
        return PlatformExpenseEntity.builder()
                .id(domain.getId())
                .description(domain.getDescription())
                .amount(domain.getAmount())
                .expenseDate(domain.getExpenseDate())
                .category(domain.getCategory())
                .build();
    }

    public PlatformExpense toDomain(PlatformExpenseEntity entity) {
        if (entity == null) return null;
        return PlatformExpense.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .amount(entity.getAmount())
                .expenseDate(entity.getExpenseDate())
                .category(entity.getCategory())
                .build();
    }
}
