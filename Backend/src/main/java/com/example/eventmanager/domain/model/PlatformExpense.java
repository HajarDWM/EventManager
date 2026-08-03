package com.example.eventmanager.domain.model;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformExpense {
    private Long id;
    private String description;
    private BigDecimal amount;
    private LocalDateTime expenseDate;
    private String category; // SERVER, TOOL, MARKETING, OTHER
}
