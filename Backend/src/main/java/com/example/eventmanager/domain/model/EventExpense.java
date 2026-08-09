package com.example.eventmanager.domain.model;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventExpense {
    private Long id;
    private Long eventId;
    private String category;
    private String description;
    private BigDecimal amount;
    private String providerName;
    private LocalDateTime expenseDate;
}
