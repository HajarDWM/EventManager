package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.TransactionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface GetTransactionsUseCase {
    Page<TransactionDTO> getTransactions(String search, String period, Pageable pageable);
    List<TransactionDTO> getAllTransactionsForExport();
}
