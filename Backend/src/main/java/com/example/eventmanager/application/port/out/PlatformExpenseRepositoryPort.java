package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.PlatformExpense;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PlatformExpenseRepositoryPort {
    PlatformExpense save(PlatformExpense expense);
    List<PlatformExpense> findAll();
    List<PlatformExpense> findByExpenseDateAfter(LocalDateTime date);
    Optional<PlatformExpense> findById(Long id);
    void deleteById(Long id);
}
