package com.example.eventmanager.infrastructure.persistence.mapper;

import com.example.eventmanager.domain.model.*;
import com.example.eventmanager.infrastructure.persistence.entity.InvoiceEntity;
import com.example.eventmanager.infrastructure.persistence.entity.PaymentEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class InvoicePersistenceMapper {

    public InvoiceEntity toEntity(Invoice domain) {
        if (domain == null) return null;

        InvoiceEntity entity = InvoiceEntity.builder()
                .id(domain.getId())
                .invoiceNumber(domain.getInvoiceNumber())
                .eventId(domain.getEventId())
                .catererId(domain.getCatererId())
                .quoteId(domain.getQuoteId())
                .type(domain.getType() != null ? domain.getType().name() : "GENERAL")
                .status(domain.getStatus() != null ? domain.getStatus().name() : "UNPAID")
                .totalHt(domain.getTotalHt())
                .taxRate(domain.getTaxRate())
                .totalVat(domain.getTotalVat())
                .totalTtc(domain.getTotalTtc())
                .dueDate(domain.getDueDate())
                .createdAt(domain.getCreatedAt())
                .build();

        if (domain.getPayments() != null) {
            List<PaymentEntity> paymentEntities = domain.getPayments().stream()
                    .map(payment -> toPaymentEntity(payment, entity))
                    .collect(Collectors.toList());
            entity.setPayments(paymentEntities);
        }

        return entity;
    }

    public PaymentEntity toPaymentEntity(Payment payment, InvoiceEntity invoiceEntity) {
        if (payment == null) return null;
        return PaymentEntity.builder()
                .id(payment.getId())
                .invoice(invoiceEntity)
                .catererId(payment.getCatererId())
                .amount(payment.getAmount())
                .paymentDate(payment.getPaymentDate())
                .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : "CARD")
                .reference(payment.getReference())
                .build();
    }

    public Invoice toDomain(InvoiceEntity entity) {
        if (entity == null) return null;

        InvoiceType typeEnum = InvoiceType.GENERAL;
        if (entity.getType() != null) {
            try {
                typeEnum = InvoiceType.valueOf(entity.getType().toUpperCase());
            } catch (Exception ignored) {}
        }

        InvoiceStatus statusEnum = InvoiceStatus.UNPAID;
        if (entity.getStatus() != null) {
            try {
                statusEnum = InvoiceStatus.valueOf(entity.getStatus().toUpperCase());
            } catch (Exception ignored) {}
        }

        Invoice domain = Invoice.builder()
                .id(entity.getId())
                .invoiceNumber(entity.getInvoiceNumber())
                .eventId(entity.getEventId())
                .catererId(entity.getCatererId())
                .quoteId(entity.getQuoteId())
                .type(typeEnum)
                .status(statusEnum)
                .totalHt(entity.getTotalHt())
                .taxRate(entity.getTaxRate())
                .totalVat(entity.getTotalVat())
                .totalTtc(entity.getTotalTtc())
                .dueDate(entity.getDueDate())
                .createdAt(entity.getCreatedAt())
                .build();

        if (entity.getPayments() != null) {
            List<Payment> domainPayments = entity.getPayments().stream()
                    .map(this::toPaymentDomain)
                    .collect(Collectors.toList());
            domain.setPayments(domainPayments);
        }

        return domain;
    }

    public Payment toPaymentDomain(PaymentEntity entity) {
        if (entity == null) return null;

        PaymentMethod methodEnum = PaymentMethod.CARD;
        if (entity.getPaymentMethod() != null) {
            try {
                methodEnum = PaymentMethod.valueOf(entity.getPaymentMethod().toUpperCase());
            } catch (Exception ignored) {}
        }

        return Payment.builder()
                .id(entity.getId())
                .invoiceId(entity.getInvoice() != null ? entity.getInvoice().getId() : null)
                .catererId(entity.getCatererId())
                .amount(entity.getAmount())
                .paymentDate(entity.getPaymentDate())
                .paymentMethod(methodEnum)
                .reference(entity.getReference())
                .build();
    }
}
