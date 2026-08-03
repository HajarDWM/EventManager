package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.TransactionDTO;
import com.example.eventmanager.domain.model.Transaction;
import org.springframework.stereotype.Component;

@Component
public class TransactionMapper {

    public TransactionDTO toDTO(Transaction domain) {
        if (domain == null) return null;
        return TransactionDTO.builder()
                .id(domain.getId())
                .catererId(domain.getCatererId())
                .businessName(domain.getBusinessName())
                .subscriptionPlan(domain.getSubscriptionPlan())
                .amountPaid(domain.getAmountPaid())
                .vatRate(domain.getVatRate())
                .paymentDate(domain.getPaymentDate())
                .paymentStatus(domain.getPaymentStatus())
                .build();
    }

    public Transaction toDomain(TransactionDTO dto) {
        if (dto == null) return null;
        return Transaction.builder()
                .id(dto.getId())
                .catererId(dto.getCatererId())
                .businessName(dto.getBusinessName())
                .subscriptionPlan(dto.getSubscriptionPlan())
                .amountPaid(dto.getAmountPaid())
                .vatRate(dto.getVatRate())
                .paymentDate(dto.getPaymentDate())
                .paymentStatus(dto.getPaymentStatus())
                .build();
    }
}
