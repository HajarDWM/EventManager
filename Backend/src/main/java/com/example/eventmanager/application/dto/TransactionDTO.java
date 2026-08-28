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
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    public LocalDateTime getEffectiveStartDate() {
        return startDate != null ? startDate : paymentDate;
    }

    public LocalDateTime getEffectiveEndDate() {
        return endDate != null ? endDate : (getEffectiveStartDate() != null ? getEffectiveStartDate().plusDays(30) : null);
    }

    public BigDecimal getAmountHt() {
        if (amountPaid == null) return BigDecimal.ZERO;
        if (vatRate == null || vatRate.compareTo(BigDecimal.ZERO) == 0) return amountPaid;
        BigDecimal divisor = BigDecimal.ONE.add(vatRate.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP));
        return amountPaid.divide(divisor, 2, java.math.RoundingMode.HALF_UP);
    }
}
