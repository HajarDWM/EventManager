package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.port.out.PaymentRepositoryPort;
import com.example.eventmanager.domain.model.Payment;
import com.example.eventmanager.infrastructure.persistence.entity.PaymentEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.InvoicePersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.InvoiceRepository;
import com.example.eventmanager.infrastructure.persistence.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class PaymentRepositoryAdapter implements PaymentRepositoryPort {

    private final PaymentRepository paymentRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoicePersistenceMapper invoicePersistenceMapper;

    @Override
    public Payment save(Payment payment) {
        PaymentEntity entity = invoicePersistenceMapper.toPaymentEntity(payment, invoiceRepository.getReferenceById(payment.getInvoiceId()));
        PaymentEntity saved = paymentRepository.save(entity);
        return invoicePersistenceMapper.toPaymentDomain(saved);
    }

    @Override
    public Optional<Payment> findById(Long id) {
        return paymentRepository.findById(id)
                .map(invoicePersistenceMapper::toPaymentDomain);
    }

    @Override
    public List<Payment> findByCatererId(Long catererId) {
        return paymentRepository.findByCatererId(catererId).stream()
                .map(invoicePersistenceMapper::toPaymentDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Payment> findByInvoiceId(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(invoicePersistenceMapper::toPaymentDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        paymentRepository.deleteById(id);
    }
}
