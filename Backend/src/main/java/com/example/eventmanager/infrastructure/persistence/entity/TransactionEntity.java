package com.example.eventmanager.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionEntity {

    @Id
    @Column(name = "id", length = 36)
    private String id;

    @Column(name = "caterer_id")
    private Long catererId;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    @Column(name = "subscription_plan", nullable = false, length = 50)
    private String subscriptionPlan;

    @Column(name = "amount_paid", nullable = false, precision = 19, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "vat_rate", nullable = false, precision = 19, scale = 2)
    private BigDecimal vatRate;

    @Column(name = "payment_date", nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "payment_status", nullable = false, length = 50)
    private String paymentStatus;
}
