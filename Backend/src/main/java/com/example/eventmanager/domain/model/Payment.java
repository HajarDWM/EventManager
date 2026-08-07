package com.example.eventmanager.domain.model;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class Payment {
    private Long id;
    private Long invoiceId;
    private Long catererId;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private PaymentMethod paymentMethod;
    private String reference; // transaction receipt / check number
    private String label;
}
