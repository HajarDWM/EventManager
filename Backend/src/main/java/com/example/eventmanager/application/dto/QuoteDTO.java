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
public class QuoteDTO {
    private Long id;
    private String reference;
    private Long eventId;
    private Long catererId;
    private List<QuoteItemDTO> items;
    private String status;
    private BigDecimal taxRate;
    private BigDecimal totalHt;
    private BigDecimal totalVat;
    private BigDecimal totalTtc;
    private LocalDateTime createdAt;
    private LocalDateTime validUntil;
}
