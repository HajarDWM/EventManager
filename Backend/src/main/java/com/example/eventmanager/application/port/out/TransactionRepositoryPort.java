package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface TransactionRepositoryPort {
    Transaction save(Transaction transaction);
    Page<Transaction> findAll(String search, Pageable pageable);
    List<Transaction> findAllForExport();
}
