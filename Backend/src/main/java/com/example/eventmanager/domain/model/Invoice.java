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
public class Invoice {
    private Long id;
    private String invoiceNumber;
    private Long eventId;
    private Long catererId;
    private Long quoteId; // optional link to Quote
    private InvoiceType type;
    private InvoiceStatus status;
    private BigDecimal totalHt;
    private BigDecimal taxRate;
    private BigDecimal totalVat;
    private BigDecimal totalTtc;
    private LocalDateTime dueDate;
    private LocalDateTime createdAt;
    
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    public BigDecimal calculateTotalPaid() {
        if (payments == null || payments.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return payments.stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public BigDecimal calculateRemainingDue() {
        BigDecimal paid = calculateTotalPaid();
        if (totalTtc == null) {
            return BigDecimal.ZERO;
        }
        BigDecimal remaining = totalTtc.subtract(paid);
        return remaining.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remaining;
    }

    public void addPayment(Payment payment) {
        if (this.payments == null) {
            this.payments = new ArrayList<>();
        }
        this.payments.add(payment);
        updateStatusBasedOnPayments();
    }

    public void updateStatusBasedOnPayments() {
        if (InvoiceStatus.CANCELLED.equals(this.status)) {
            return;
        }
        
        BigDecimal paid = calculateTotalPaid();
        if (totalTtc == null || totalTtc.compareTo(BigDecimal.ZERO) <= 0) {
            this.status = InvoiceStatus.PAID;
            return;
        }

        if (paid.compareTo(BigDecimal.ZERO) <= 0) {
            this.status = InvoiceStatus.UNPAID;
        } else if (paid.compareTo(totalTtc) >= 0) {
            this.status = InvoiceStatus.PAID;
        } else {
            this.status = InvoiceStatus.PARTIALLY_PAID;
        }
    }
}
