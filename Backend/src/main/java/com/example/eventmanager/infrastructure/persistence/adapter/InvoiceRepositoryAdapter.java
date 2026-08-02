package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.port.out.InvoiceRepositoryPort;
import com.example.eventmanager.domain.model.Invoice;
import com.example.eventmanager.infrastructure.persistence.entity.InvoiceEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.InvoicePersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.InvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class InvoiceRepositoryAdapter implements InvoiceRepositoryPort {

    private final InvoiceRepository invoiceRepository;
    private final InvoicePersistenceMapper invoicePersistenceMapper;

    @Override
    public Invoice save(Invoice invoice) {
        InvoiceEntity entity = invoicePersistenceMapper.toEntity(invoice);
        InvoiceEntity saved = invoiceRepository.save(entity);
        return invoicePersistenceMapper.toDomain(saved);
    }

    @Override
    public Optional<Invoice> findById(Long id) {
        return invoiceRepository.findById(id)
                .map(invoicePersistenceMapper::toDomain);
    }

    @Override
    public Optional<Invoice> findByInvoiceNumber(String invoiceNumber) {
        return invoiceRepository.findByInvoiceNumber(invoiceNumber)
                .map(invoicePersistenceMapper::toDomain);
    }

    @Override
    public List<Invoice> findByCatererId(Long catererId) {
        return invoiceRepository.findByCatererId(catererId).stream()
                .map(invoicePersistenceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Invoice> findByEventId(Long eventId) {
        return invoiceRepository.findByEventId(eventId).stream()
                .map(invoicePersistenceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        invoiceRepository.deleteById(id);
    }
}
