package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.port.out.TransactionRepositoryPort;
import com.example.eventmanager.domain.model.Transaction;
import com.example.eventmanager.infrastructure.persistence.entity.TransactionEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.TransactionPersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.JpaTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TransactionRepositoryAdapter implements TransactionRepositoryPort {

    private final JpaTransactionRepository jpaTransactionRepository;
    private final TransactionPersistenceMapper transactionPersistenceMapper;

    @Override
    public Transaction save(Transaction transaction) {
        TransactionEntity entity = transactionPersistenceMapper.toEntity(transaction);
        TransactionEntity saved = jpaTransactionRepository.save(entity);
        return transactionPersistenceMapper.toDomain(saved);
    }

    @Override
    public Page<Transaction> findAll(String search, String period, Pageable pageable) {
        java.time.LocalDateTime sinceDate = getSinceDateForPeriod(period);
        Page<TransactionEntity> entities;

        if (sinceDate != null) {
            if (search != null && !search.trim().isEmpty()) {
                entities = jpaTransactionRepository.searchTransactionsSince(search, sinceDate, pageable);
            } else {
                entities = jpaTransactionRepository.findAllSince(sinceDate, pageable);
            }
        } else {
            if (search != null && !search.trim().isEmpty()) {
                entities = jpaTransactionRepository.searchTransactions(search, pageable);
            } else {
                entities = jpaTransactionRepository.findAll(pageable);
            }
        }
        return entities.map(transactionPersistenceMapper::toDomain);
    }

    private java.time.LocalDateTime getSinceDateForPeriod(String period) {
        if (period == null || period.trim().isEmpty()) {
            return null;
        }
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        switch (period.toUpperCase()) {
            case "1_MONTH":
                return now.minusMonths(1);
            case "3_MONTHS":
                return now.minusMonths(3);
            case "1_YEAR":
                return now.minusYears(1);
            default:
                return null;
        }
    }

    @Override
    public List<Transaction> findAllForExport() {
        // Fetch all sorted by paymentDate desc
        List<TransactionEntity> entities = jpaTransactionRepository.findAll(Sort.by(Sort.Direction.DESC, "paymentDate"));
        return entities.stream()
                .map(transactionPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public List<Transaction> findSuccessfulTransactionsSince(java.time.LocalDateTime sinceDate) {
        return jpaTransactionRepository.findByPaymentStatusAndPaymentDateAfter("SUCCESS", sinceDate).stream()
                .map(transactionPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public List<Transaction> findByCatererId(Long catererId) {
        return jpaTransactionRepository.findByCatererIdOrderByPaymentDateDesc(catererId).stream()
                .map(transactionPersistenceMapper::toDomain)
                .toList();
    }
}
