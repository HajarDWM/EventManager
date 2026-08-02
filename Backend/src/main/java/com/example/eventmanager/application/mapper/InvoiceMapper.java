package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.InvoiceDTO;
import com.example.eventmanager.application.dto.PaymentDTO;
import com.example.eventmanager.domain.model.Invoice;
import com.example.eventmanager.domain.model.InvoiceStatus;
import com.example.eventmanager.domain.model.InvoiceType;
import com.example.eventmanager.domain.model.Payment;
import com.example.eventmanager.domain.model.PaymentMethod;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class InvoiceMapper {

    public InvoiceDTO toDTO(Invoice domain) {
        if (domain == null) return null;

        List<PaymentDTO> paymentDTOs = new ArrayList<>();
        if (domain.getPayments() != null) {
            paymentDTOs = domain.getPayments().stream()
                    .map(this::toPaymentDTO)
                    .collect(Collectors.toList());
        }

        return InvoiceDTO.builder()
                .id(domain.getId())
                .invoiceNumber(domain.getInvoiceNumber())
                .eventId(domain.getEventId())
                .catererId(domain.getCatererId())
                .quoteId(domain.getQuoteId())
                .type(domain.getType() != null ? domain.getType().name() : null)
                .status(domain.getStatus() != null ? domain.getStatus().name() : null)
                .totalHt(domain.getTotalHt())
                .taxRate(domain.getTaxRate())
                .totalVat(domain.getTotalVat())
                .totalTtc(domain.getTotalTtc())
                .dueDate(domain.getDueDate())
                .createdAt(domain.getCreatedAt())
                .payments(paymentDTOs)
                .totalPaid(domain.calculateTotalPaid())
                .remainingDue(domain.calculateRemainingDue())
                .build();
    }

    public PaymentDTO toPaymentDTO(Payment payment) {
        if (payment == null) return null;
        return PaymentDTO.builder()
                .id(payment.getId())
                .invoiceId(payment.getInvoiceId())
                .catererId(payment.getCatererId())
                .amount(payment.getAmount())
                .paymentDate(payment.getPaymentDate())
                .paymentMethod(payment.getPaymentMethod() != null ? payment.getPaymentMethod().name() : null)
                .reference(payment.getReference())
                .build();
    }

    public Invoice toDomain(InvoiceDTO dto) {
        if (dto == null) return null;

        List<Payment> domainPayments = new ArrayList<>();
        if (dto.getPayments() != null) {
            domainPayments = dto.getPayments().stream()
                    .map(this::toPaymentDomain)
                    .collect(Collectors.toList());
        }

        InvoiceType typeEnum = InvoiceType.GENERAL;
        if (dto.getType() != null) {
            try {
                typeEnum = InvoiceType.valueOf(dto.getType().toUpperCase());
            } catch (Exception ignored) {}
        }

        InvoiceStatus statusEnum = InvoiceStatus.UNPAID;
        if (dto.getStatus() != null) {
            try {
                statusEnum = InvoiceStatus.valueOf(dto.getStatus().toUpperCase());
            } catch (Exception ignored) {}
        }

        return Invoice.builder()
                .id(dto.getId())
                .invoiceNumber(dto.getInvoiceNumber())
                .eventId(dto.getEventId())
                .catererId(dto.getCatererId())
                .quoteId(dto.getQuoteId())
                .type(typeEnum)
                .status(statusEnum)
                .totalHt(dto.getTotalHt())
                .taxRate(dto.getTaxRate())
                .totalVat(dto.getTotalVat())
                .totalTtc(dto.getTotalTtc())
                .dueDate(dto.getDueDate())
                .createdAt(dto.getCreatedAt())
                .payments(domainPayments)
                .build();
    }

    public Payment toPaymentDomain(PaymentDTO paymentDTO) {
        if (paymentDTO == null) return null;

        PaymentMethod methodEnum = PaymentMethod.CARD;
        if (paymentDTO.getPaymentMethod() != null) {
            try {
                methodEnum = PaymentMethod.valueOf(paymentDTO.getPaymentMethod().toUpperCase());
            } catch (Exception ignored) {}
        }

        return Payment.builder()
                .id(paymentDTO.getId())
                .invoiceId(paymentDTO.getInvoiceId())
                .catererId(paymentDTO.getCatererId())
                .amount(paymentDTO.getAmount())
                .paymentDate(paymentDTO.getPaymentDate())
                .paymentMethod(methodEnum)
                .reference(paymentDTO.getReference())
                .build();
    }
}
