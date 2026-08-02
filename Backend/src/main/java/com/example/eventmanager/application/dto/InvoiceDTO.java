package com.example.eventmanager.application.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceDTO {
    private Long id;
    private String invoiceNumber;
    private Long eventId;
    private Long catererId;
    private Long quoteId;
    private String type;
    private String status;
    private BigDecimal totalHt;
    private BigDecimal taxRate;
    private BigDecimal totalVat;
    private BigDecimal totalTtc;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    private List<PaymentDTO> payments;
    private BigDecimal totalPaid;
    private BigDecimal remainingDue;
}
