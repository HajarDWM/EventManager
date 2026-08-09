package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.EventExpenseDTO;
import com.example.eventmanager.domain.model.EventExpense;
import org.springframework.stereotype.Component;

@Component
public class EventExpenseMapper {

    public EventExpenseDTO toDTO(EventExpense domain) {
        if (domain == null) return null;
        return EventExpenseDTO.builder()
                .id(domain.getId())
                .eventId(domain.getEventId())
                .category(domain.getCategory())
                .description(domain.getDescription())
                .amount(domain.getAmount())
                .providerName(domain.getProviderName())
                .expenseDate(domain.getExpenseDate())
                .build();
    }

    public EventExpense toDomain(EventExpenseDTO dto) {
        if (dto == null) return null;
        return EventExpense.builder()
                .id(dto.getId())
                .eventId(dto.getEventId())
                .category(dto.getCategory())
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .providerName(dto.getProviderName())
                .expenseDate(dto.getExpenseDate())
                .build();
    }
}
