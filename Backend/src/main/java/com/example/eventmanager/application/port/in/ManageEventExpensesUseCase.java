package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.EventExpenseDTO;
import java.util.List;

public interface ManageEventExpensesUseCase {
    List<EventExpenseDTO> getExpensesByEventId(Long eventId);
    EventExpenseDTO addExpense(Long eventId, EventExpenseDTO dto);
    EventExpenseDTO updateExpense(Long eventId, Long expenseId, EventExpenseDTO dto);
    void deleteExpense(Long eventId, Long expenseId);
}
