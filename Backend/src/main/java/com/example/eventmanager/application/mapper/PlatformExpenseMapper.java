package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.PlatformExpenseDTO;
import com.example.eventmanager.domain.model.PlatformExpense;
import org.springframework.stereotype.Component;

@Component
public class PlatformExpenseMapper {

    public PlatformExpenseDTO toDTO(PlatformExpense domain) {
        if (domain == null) return null;
        return PlatformExpenseDTO.builder()
                .id(domain.getId())
                .description(domain.getDescription())
                .amount(domain.getAmount())
                .expenseDate(domain.getExpenseDate())
                .category(domain.getCategory())
                .build();
    }

    public PlatformExpense toDomain(PlatformExpenseDTO dto) {
        if (dto == null) return null;
        return PlatformExpense.builder()
                .id(dto.getId())
                .description(dto.getDescription())
                .amount(dto.getAmount())
                .expenseDate(dto.getExpenseDate())
                .category(dto.getCategory())
                .build();
    }
}
