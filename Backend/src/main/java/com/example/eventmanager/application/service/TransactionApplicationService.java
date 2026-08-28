package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.TransactionDTO;
import com.example.eventmanager.application.mapper.TransactionMapper;
import com.example.eventmanager.application.port.in.GetTransactionsUseCase;
import com.example.eventmanager.application.port.in.RecordTransactionUseCase;
import com.example.eventmanager.application.port.out.CatererRepositoryPort;
import com.example.eventmanager.application.port.out.TransactionRepositoryPort;
import com.example.eventmanager.domain.model.Caterer;
import com.example.eventmanager.domain.model.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionApplicationService implements GetTransactionsUseCase, RecordTransactionUseCase {

    private final TransactionRepositoryPort transactionRepositoryPort;
    private final CatererRepositoryPort catererRepositoryPort;
    private final TransactionMapper transactionMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<TransactionDTO> getTransactions(String search, String period, Pageable pageable) {
        Page<Transaction> transactions = transactionRepositoryPort.findAll(search, period, pageable);
        return transactions.map(transactionMapper::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getAllTransactionsForExport() {
        return transactionRepositoryPort.findAllForExport().stream()
                .map(transactionMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionDTO> getTransactionsByCatererId(Long catererId) {
        return transactionRepositoryPort.findByCatererId(catererId).stream()
                .map(transactionMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public void recordTransaction(Long catererId, String plan, BigDecimal amountPaid, BigDecimal vatRate, String paymentStatus) {
        Caterer caterer = catererRepositoryPort.findById(catererId)
                .orElseThrow(() -> new RuntimeException("Caterer not found for ID: " + catererId));

        Transaction transaction = Transaction.builder()
                .id(UUID.randomUUID().toString())
                .catererId(catererId)
                .businessName(caterer.getBusinessName())
                .subscriptionPlan(plan)
                .amountPaid(amountPaid)
                .vatRate(vatRate)
                .paymentDate(LocalDateTime.now())
                .paymentStatus(paymentStatus)
                .build();

        transactionRepositoryPort.save(transaction);
    }
}
