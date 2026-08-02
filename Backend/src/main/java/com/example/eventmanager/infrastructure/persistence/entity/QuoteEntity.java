package com.example.eventmanager.infrastructure.persistence.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "quotes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuoteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String reference;

    @Column(name = "event_id", nullable = false)
    private Long eventId;

    @Column(name = "caterer_id", nullable = false)
    private Long catererId;

    @Builder.Default
    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<QuoteItemEntity> items = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "tax_rate", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.valueOf(20.00);

    @Column(name = "total_ht", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalHt = BigDecimal.ZERO;

    @Column(name = "total_vat", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalVat = BigDecimal.ZERO;

    @Column(name = "total_ttc", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalTtc = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "valid_until")
    private LocalDateTime validUntil;
}
