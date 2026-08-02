package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.InvoiceEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<InvoiceEntity, Long> {
    List<InvoiceEntity> findByCatererId(Long catererId);
    List<InvoiceEntity> findByEventId(Long eventId);
    Optional<InvoiceEntity> findByInvoiceNumber(String invoiceNumber);
}
