package com.example.eventmanager.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionDTO {
    private String id;
    private Long catererId;
    private String businessName;
    private String subscriptionPlan;
    private BigDecimal amountPaid;
    private BigDecimal vatRate;
    private LocalDateTime paymentDate;
    private String paymentStatus;
}
