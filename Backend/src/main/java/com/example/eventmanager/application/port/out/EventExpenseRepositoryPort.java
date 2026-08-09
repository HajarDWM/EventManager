package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.EventExpense;
import java.util.List;
import java.util.Optional;

public interface EventExpenseRepositoryPort {
    EventExpense save(EventExpense expense);
    List<EventExpense> findByEventId(Long eventId);
    Optional<EventExpense> findById(Long id);
    void deleteById(Long id);
}
