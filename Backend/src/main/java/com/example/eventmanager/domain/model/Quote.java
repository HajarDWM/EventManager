package com.example.eventmanager.domain.model;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Builder
public class Quote {
    private Long id;
    private String reference;
    private Long eventId;
    private Long catererId;
    
    @Builder.Default
    private List<QuoteItem> items = new ArrayList<>();
    
    private QuoteStatus status;
    private BigDecimal taxRate; // e.g. 20.00
    private BigDecimal totalHt;
    private BigDecimal totalVat;
    private BigDecimal totalTtc;
    private LocalDateTime createdAt;
    private LocalDateTime validUntil;

    public void calculateTotals() {
        if (items == null || items.isEmpty()) {
            this.totalHt = BigDecimal.ZERO;
            this.totalVat = BigDecimal.ZERO;
            this.totalTtc = BigDecimal.ZERO;
            return;
        }

        BigDecimal htSum = BigDecimal.ZERO;
        for (QuoteItem item : items) {
            htSum = htSum.add(item.calculateTotalPrice());
        }
        this.totalHt = htSum;

        if (taxRate == null || taxRate.compareTo(BigDecimal.ZERO) <= 0) {
            this.totalVat = BigDecimal.ZERO;
            this.totalTtc = this.totalHt;
        } else {
            // totalVat = totalHt * (taxRate / 100)
            this.totalVat = this.totalHt.multiply(taxRate).divide(BigDecimal.valueOf(100), 2, java.math.RoundingMode.HALF_UP);
            this.totalTtc = this.totalHt.add(this.totalVat);
        }
    }

    public void accept() {
        if (QuoteStatus.DRAFT.equals(this.status) || QuoteStatus.SENT.equals(this.status)) {
            this.status = QuoteStatus.ACCEPTED;
        } else {
            throw new IllegalStateException("Seul un devis Brouillon ou Envoyé peut être accepté.");
        }
    }

    public void reject() {
        if (QuoteStatus.DRAFT.equals(this.status) || QuoteStatus.SENT.equals(this.status)) {
            this.status = QuoteStatus.REJECTED;
        } else {
            throw new IllegalStateException("Seul un devis Brouillon ou Envoyé peut être refusé.");
        }
    }
}
