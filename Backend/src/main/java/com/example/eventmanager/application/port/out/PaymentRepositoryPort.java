package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.Payment;
import java.util.List;
import java.util.Optional;

public interface PaymentRepositoryPort {
    Payment save(Payment payment);
    Optional<Payment> findById(Long id);
    List<Payment> findByCatererId(Long catererId);
    List<Payment> findByInvoiceId(Long invoiceId);
    void deleteById(Long id);
}
