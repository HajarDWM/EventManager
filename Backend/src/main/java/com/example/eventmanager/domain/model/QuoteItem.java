package com.example.eventmanager.domain.model;

import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;

@Getter
@Builder
public class QuoteItem {
    private Long id;
    private String description;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;

    public BigDecimal calculateTotalPrice() {
        if (unitPrice == null) {
            this.totalPrice = BigDecimal.ZERO;
            return BigDecimal.ZERO;
        }
        this.totalPrice = unitPrice.multiply(BigDecimal.valueOf(quantity));
        return this.totalPrice;
    }
}
