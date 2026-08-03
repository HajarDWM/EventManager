package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface TransactionRepositoryPort {
    Transaction save(Transaction transaction);
    Page<Transaction> findAll(String search, String period, Pageable pageable);
    List<Transaction> findAllForExport();
    List<Transaction> findSuccessfulTransactionsSince(java.time.LocalDateTime sinceDate);
}
