package com.example.eventmanager.application.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FinancialStatsDTO {
    private BigDecimal totalRevenueCurrentMonth;
    private BigDecimal totalRevenueLast3Months;
    private BigDecimal totalRevenueLastYear;
    private BigDecimal totalRevenueSelectedPeriod;
    private BigDecimal totalExpensesSelectedPeriod;
    private BigDecimal netProfitSelectedPeriod;
}
