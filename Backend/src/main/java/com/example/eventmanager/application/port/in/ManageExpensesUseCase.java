package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.PlatformExpenseDTO;
import com.example.eventmanager.application.dto.FinancialStatsDTO;
import java.util.List;

public interface ManageExpensesUseCase {
    PlatformExpenseDTO createExpense(PlatformExpenseDTO dto);
    List<PlatformExpenseDTO> getAllExpenses();
    void deleteExpense(Long id);
    FinancialStatsDTO getFinancialStats(String period);
    PlatformExpenseDTO updateExpense(PlatformExpenseDTO dto);
}
