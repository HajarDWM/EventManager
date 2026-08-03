package com.example.eventmanager.domain.model;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction {
    private String id;
    private Long catererId;
    private String businessName;
    private String subscriptionPlan;
    private BigDecimal amountPaid;
    private BigDecimal vatRate;
    private LocalDateTime paymentDate;
    private String paymentStatus;
}
