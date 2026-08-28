package com.example.eventmanager.infrastructure.persistence.mapper;

import com.example.eventmanager.domain.model.Transaction;
import com.example.eventmanager.infrastructure.persistence.entity.TransactionEntity;
import org.springframework.stereotype.Component;

@Component
public class TransactionPersistenceMapper {

    public TransactionEntity toEntity(Transaction domain) {
        if (domain == null) return null;
        return TransactionEntity.builder()
                .id(domain.getId())
                .catererId(domain.getCatererId())
                .businessName(domain.getBusinessName())
                .subscriptionPlan(domain.getSubscriptionPlan())
                .amountPaid(domain.getAmountPaid())
                .vatRate(domain.getVatRate())
                .paymentDate(domain.getPaymentDate())
                .paymentStatus(domain.getPaymentStatus())
                .startDate(domain.getStartDate())
                .endDate(domain.getEndDate())
                .build();
    }

    public Transaction toDomain(TransactionEntity entity) {
        if (entity == null) return null;
        return Transaction.builder()
                .id(entity.getId())
                .catererId(entity.getCatererId())
                .businessName(entity.getBusinessName())
                .subscriptionPlan(entity.getSubscriptionPlan())
                .amountPaid(entity.getAmountPaid())
                .vatRate(entity.getVatRate())
                .paymentDate(entity.getPaymentDate())
                .paymentStatus(entity.getPaymentStatus())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .build();
    }
}
