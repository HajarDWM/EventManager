package com.example.eventmanager.application.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteItemDTO {
    private Long id;
    private String description;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}
