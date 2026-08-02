package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.Invoice;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepositoryPort {
    Invoice save(Invoice invoice);
    Optional<Invoice> findById(Long id);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    List<Invoice> findByCatererId(Long catererId);
    List<Invoice> findByEventId(Long eventId);
    void deleteById(Long id);
}
