package com.example.eventmanager.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventExpenseDTO {
    private Long id;
    private Long eventId;
    private String category;
    private String description;
    private BigDecimal amount;
    private String providerName;
    private LocalDateTime expenseDate;
}
