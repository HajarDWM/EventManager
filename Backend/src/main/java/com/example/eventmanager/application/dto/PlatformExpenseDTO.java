package com.example.eventmanager.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformExpenseDTO {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDateTime expenseDate;
    private String category;
}
