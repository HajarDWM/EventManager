package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.FinancialStatsDTO;
import com.example.eventmanager.application.dto.PlatformExpenseDTO;
import com.example.eventmanager.application.mapper.PlatformExpenseMapper;
import com.example.eventmanager.application.port.in.ManageExpensesUseCase;
import com.example.eventmanager.application.port.out.PlatformExpenseRepositoryPort;
import com.example.eventmanager.application.port.out.TransactionRepositoryPort;
import com.example.eventmanager.domain.model.PlatformExpense;
import com.example.eventmanager.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PlatformExpenseApplicationService implements ManageExpensesUseCase {

    private final PlatformExpenseRepositoryPort expenseRepositoryPort;
    private final TransactionRepositoryPort transactionRepositoryPort;
    private final PlatformExpenseMapper expenseMapper;

    @Override
    @Transactional
    public PlatformExpenseDTO createExpense(PlatformExpenseDTO dto) {
        if (dto.getExpenseDate() == null) {
            dto.setExpenseDate(LocalDateTime.now());
        }
        PlatformExpense expense = expenseMapper.toDomain(dto);
        PlatformExpense saved = expenseRepositoryPort.save(expense);
        return expenseMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PlatformExpenseDTO> getAllExpenses() {
        return expenseRepositoryPort.findAll().stream()
                .map(expenseMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public void deleteExpense(Long id) {
        expenseRepositoryPort.deleteById(id);
    }

    @Override
    @Transactional
    public PlatformExpenseDTO updateExpense(PlatformExpenseDTO dto) {
        PlatformExpense existing = expenseRepositoryPort.findById(dto.getId())
                .orElseThrow(() -> new IllegalArgumentException("Platform expense not found with ID: " + dto.getId()));
        existing.setDescription(dto.getDescription());
        existing.setAmount(dto.getAmount());
        existing.setExpenseDate(dto.getExpenseDate());
        existing.setCategory(dto.getCategory());
        PlatformExpense saved = expenseRepositoryPort.save(existing);
        return expenseMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FinancialStatsDTO getFinancialStats(String period) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Current Month (since start of current calendar month)
        LocalDateTime startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0).withNano(0);
        BigDecimal revCurrentMonth = calculateRevenueSince(startOfMonth);

        // 2. Last 3 Months (since 3 months ago)
        LocalDateTime threeMonthsAgo = now.minusMonths(3);
        BigDecimal revLast3Months = calculateRevenueSince(threeMonthsAgo);

        // 3. Last Year (since 1 year ago)
        LocalDateTime oneYearAgo = now.minusYears(1);
        BigDecimal revLastYear = calculateRevenueSince(oneYearAgo);

        // 4. Selected Period Metrics
        LocalDateTime selectedPeriodStart = getSinceDateForPeriod(period);
        BigDecimal revSelectedPeriod = calculateRevenueSince(selectedPeriodStart);
        BigDecimal expSelectedPeriod = calculateExpensesSince(selectedPeriodStart);
        BigDecimal netProfit = revSelectedPeriod.subtract(expSelectedPeriod);

        return FinancialStatsDTO.builder()
                .totalRevenueCurrentMonth(revCurrentMonth)
                .totalRevenueLast3Months(revLast3Months)
                .totalRevenueLastYear(revLastYear)
                .totalRevenueSelectedPeriod(revSelectedPeriod)
                .totalExpensesSelectedPeriod(expSelectedPeriod)
                .netProfitSelectedPeriod(netProfit)
                .build();
    }

    private BigDecimal calculateRevenueSince(LocalDateTime sinceDate) {
        List<Transaction> txs = transactionRepositoryPort.findSuccessfulTransactionsSince(sinceDate);
        return txs.stream()
                .map(t -> {
                    // Compute HT Revenue: HT = amountPaid / (1 + vatRate / 100)
                    BigDecimal amount = t.getAmountPaid() != null ? t.getAmountPaid() : BigDecimal.ZERO;
                    BigDecimal vat = t.getVatRate() != null ? t.getVatRate() : BigDecimal.valueOf(20.0);
                    if (vat.compareTo(BigDecimal.ZERO) == 0) {
                        return amount;
                    }
                    BigDecimal divisor = BigDecimal.ONE.add(vat.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP));
                    return amount.divide(divisor, 2, java.math.RoundingMode.HALF_UP);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateExpensesSince(LocalDateTime sinceDate) {
        List<PlatformExpense> expenses = expenseRepositoryPort.findByExpenseDateAfter(sinceDate);
        return expenses.stream()
                .map(e -> e.getAmount() != null ? e.getAmount() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private LocalDateTime getSinceDateForPeriod(String period) {
        if (period == null || period.trim().isEmpty()) {
            return LocalDateTime.now().minusMonths(1); // Default to 1 Month
        }
        LocalDateTime now = LocalDateTime.now();
        switch (period.toUpperCase()) {
            case "1_MONTH":
                return now.minusMonths(1);
            case "3_MONTHS":
                return now.minusMonths(3);
            case "1_YEAR":
                return now.minusYears(1);
            default:
                return now.minusMonths(1);
        }
    }
}
