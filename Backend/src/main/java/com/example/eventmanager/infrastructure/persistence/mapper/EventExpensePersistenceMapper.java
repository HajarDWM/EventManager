package com.example.eventmanager.infrastructure.persistence.mapper;

import com.example.eventmanager.domain.model.EventExpense;
import com.example.eventmanager.infrastructure.persistence.entity.EventExpenseEntity;
import org.springframework.stereotype.Component;

@Component
public class EventExpensePersistenceMapper {

    public EventExpenseEntity toEntity(EventExpense domain) {
        if (domain == null) return null;
        return EventExpenseEntity.builder()
                .id(domain.getId())
                .eventId(domain.getEventId())
                .category(domain.getCategory())
                .description(domain.getDescription())
                .amount(domain.getAmount())
                .providerName(domain.getProviderName())
                .expenseDate(domain.getExpenseDate())
                .build();
    }

    public EventExpense toDomain(EventExpenseEntity entity) {
        if (entity == null) return null;
        return EventExpense.builder()
                .id(entity.getId())
                .eventId(entity.getEventId())
                .category(entity.getCategory())
                .description(entity.getDescription())
                .amount(entity.getAmount())
                .providerName(entity.getProviderName())
                .expenseDate(entity.getExpenseDate())
                .build();
    }
}
