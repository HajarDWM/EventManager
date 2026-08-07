package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.InvoiceDTO;
import com.example.eventmanager.application.dto.PaymentDTO;
import com.example.eventmanager.application.dto.QuoteDTO;
import com.example.eventmanager.application.mapper.InvoiceMapper;
import com.example.eventmanager.application.mapper.QuoteMapper;
import com.example.eventmanager.application.port.in.ManageInvoiceUseCase;
import com.example.eventmanager.application.port.in.ManageQuoteUseCase;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.InvoiceRepositoryPort;
import com.example.eventmanager.application.port.out.PaymentRepositoryPort;
import com.example.eventmanager.application.port.out.QuoteRepositoryPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.exception.EventNotFoundException;
import com.example.eventmanager.domain.exception.UnauthorizedAccessException;
import com.example.eventmanager.domain.model.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingApplicationService implements ManageQuoteUseCase, ManageInvoiceUseCase {

    private final QuoteRepositoryPort quoteRepositoryPort;
    private final InvoiceRepositoryPort invoiceRepositoryPort;
    private final PaymentRepositoryPort paymentRepositoryPort;
    private final EventRepositoryPort eventRepositoryPort;
    private final SecurityContextPort securityContextPort;
    private final QuoteMapper quoteMapper;
    private final InvoiceMapper invoiceMapper;

    private void verifyEventOwnership(Long eventId) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        if (event.getCatererId() != null && !event.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Accès non autorisé à cet événement");
        }
    }

    private String generateQuoteReference(Long eventId) {
        return "QT-" + eventId + "-" + String.format("%04d", (int)(Math.random() * 10000));
    }

    private String generateInvoiceNumber(Long eventId) {
        return "INV-" + eventId + "-" + String.format("%04d", (int)(Math.random() * 10000));
    }

    @Override
    @Transactional
    public QuoteDTO createQuote(Long eventId, QuoteDTO quoteDTO) {
        verifyEventOwnership(eventId);
        Long currentCatererId = securityContextPort.getCurrentCatererId();

        Quote quote = quoteMapper.toDomain(quoteDTO);
        quote.setEventId(eventId);
        quote.setCatererId(currentCatererId);
        quote.setStatus(QuoteStatus.DRAFT);
        quote.setReference(generateQuoteReference(eventId));
        quote.setCreatedAt(LocalDateTime.now());
        if (quote.getTaxRate() == null) {
            quote.setTaxRate(BigDecimal.valueOf(20.00));
        }
        quote.calculateTotals();

        Quote saved = quoteRepositoryPort.save(quote);
        return quoteMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public QuoteDTO getQuoteById(Long id) {
        Quote quote = quoteRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis introuvable avec l'id: " + id));
        verifyEventOwnership(quote.getEventId());
        return quoteMapper.toDTO(quote);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteDTO> getQuotesByEventId(Long eventId) {
        verifyEventOwnership(eventId);
        return quoteRepositoryPort.findByEventId(eventId).stream()
                .map(quoteMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public QuoteDTO updateQuote(Long id, QuoteDTO quoteDTO) {
        Quote existing = quoteRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis introuvable avec l'id: " + id));
        verifyEventOwnership(existing.getEventId());



        Quote quote = quoteMapper.toDomain(quoteDTO);
        existing.setItems(quote.getItems());
        if (quote.getTaxRate() != null) {
            existing.setTaxRate(quote.getTaxRate());
        }
        if (quoteDTO.getStatus() != null) {
            try {
                existing.setStatus(QuoteStatus.valueOf(quoteDTO.getStatus().toUpperCase()));
            } catch (Exception ignored) {}
        }
        existing.calculateTotals();

        Quote saved = quoteRepositoryPort.save(existing);
        
        // Sync invoice totals
        invoiceRepositoryPort.findByEventId(existing.getEventId()).stream()
                .filter(inv -> saved.getId().equals(inv.getQuoteId()))
                .forEach(inv -> {
                    inv.setTotalHt(saved.getTotalHt());
                    inv.setTotalVat(saved.getTotalVat());
                    inv.setTotalTtc(saved.getTotalTtc());
                    inv.updateStatusBasedOnPayments();
                    invoiceRepositoryPort.save(inv);
                });

        return quoteMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteQuote(Long id) {
        Quote existing = quoteRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis introuvable avec l'id: " + id));
        verifyEventOwnership(existing.getEventId());
        
        if (QuoteStatus.INVOICED.equals(existing.getStatus())) {
            throw new IllegalStateException("Impossible de supprimer un devis déjà facturé.");
        }

        quoteRepositoryPort.deleteById(id);
    }

    @Override
    @Transactional
    public QuoteDTO acceptQuote(Long id) {
        Quote quote = quoteRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis introuvable avec l'id: " + id));
        verifyEventOwnership(quote.getEventId());
        
        quote.accept();
        Quote saved = quoteRepositoryPort.save(quote);
        return quoteMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public QuoteDTO rejectQuote(Long id) {
        Quote quote = quoteRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Devis introuvable avec l'id: " + id));
        verifyEventOwnership(quote.getEventId());
        
        quote.reject();
        Quote saved = quoteRepositoryPort.save(quote);
        return quoteMapper.toDTO(saved);
    }

    // --- FACTURATION ---

    @Override
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoiceById(Long id) {
        Invoice invoice = invoiceRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture introuvable avec l'id: " + id));
        verifyEventOwnership(invoice.getEventId());
        return invoiceMapper.toDTO(invoice);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceDTO> getInvoicesByEventId(Long eventId) {
        verifyEventOwnership(eventId);
        return invoiceRepositoryPort.findByEventId(eventId).stream()
                .map(invoiceMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public InvoiceDTO generateInvoiceFromQuote(Long quoteId, String type, BigDecimal percentage) {
        Quote quote = quoteRepositoryPort.findById(quoteId)
                .orElseThrow(() -> new RuntimeException("Devis introuvable avec l'id: " + quoteId));
        verifyEventOwnership(quote.getEventId());

        if (!QuoteStatus.ACCEPTED.equals(quote.getStatus())) {
            throw new IllegalStateException("Le devis doit être accepté pour générer une facture.");
        }

        InvoiceType invoiceType = InvoiceType.GENERAL;
        try {
            invoiceType = InvoiceType.valueOf(type.toUpperCase());
        } catch (Exception ignored) {}

        BigDecimal coef = BigDecimal.ONE;
        if (InvoiceType.DEPOSIT.equals(invoiceType)) {
            if (percentage == null || percentage.compareTo(BigDecimal.ZERO) <= 0 || percentage.compareTo(BigDecimal.valueOf(100)) > 0) {
                percentage = BigDecimal.valueOf(30.00); // 30% par défaut pour l'acompte
            }
            coef = percentage.divide(BigDecimal.valueOf(100), 4, java.math.RoundingMode.HALF_UP);
        } else if (InvoiceType.FINAL.equals(invoiceType)) {
            // Pour le solde, on déduit les factures d'acomptes déjà émises sur ce devis
            List<Invoice> existingInvoices = invoiceRepositoryPort.findByEventId(quote.getEventId());
            BigDecimal alreadyInvoiced = existingInvoices.stream()
                    .filter(inv -> quoteId.equals(inv.getQuoteId()) && InvoiceType.DEPOSIT.equals(inv.getType()))
                    .map(Invoice::getTotalTtc)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal finalTtc = quote.getTotalTtc().subtract(alreadyInvoiced);
            BigDecimal finalHt = quote.getTotalHt().subtract(existingInvoices.stream()
                    .filter(inv -> quoteId.equals(inv.getQuoteId()) && InvoiceType.DEPOSIT.equals(inv.getType()))
                    .map(Invoice::getTotalHt)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));

            BigDecimal finalVat = finalTtc.subtract(finalHt);

            Invoice finalInvoice = Invoice.builder()
                    .invoiceNumber(generateInvoiceNumber(quote.getEventId()))
                    .eventId(quote.getEventId())
                    .catererId(quote.getCatererId())
                    .quoteId(quoteId)
                    .type(InvoiceType.FINAL)
                    .status(InvoiceStatus.UNPAID)
                    .totalHt(finalHt)
                    .taxRate(quote.getTaxRate())
                    .totalVat(finalVat)
                    .totalTtc(finalTtc)
                    .dueDate(LocalDateTime.now().plusDays(15))
                    .createdAt(LocalDateTime.now())
                    .build();

            quote.setStatus(QuoteStatus.INVOICED);
            quoteRepositoryPort.save(quote);

            Invoice saved = invoiceRepositoryPort.save(finalInvoice);
            return invoiceMapper.toDTO(saved);
        }

        // Calcul des montants au prorata (pour Acompte ou Général)
        BigDecimal totalHt = quote.getTotalHt().multiply(coef).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal totalVat = quote.getTotalVat().multiply(coef).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal totalTtc = quote.getTotalTtc().multiply(coef).setScale(2, java.math.RoundingMode.HALF_UP);

        Invoice invoice = Invoice.builder()
                .invoiceNumber(generateInvoiceNumber(quote.getEventId()))
                .eventId(quote.getEventId())
                .catererId(quote.getCatererId())
                .quoteId(quoteId)
                .type(invoiceType)
                .status(InvoiceStatus.UNPAID)
                .totalHt(totalHt)
                .taxRate(quote.getTaxRate())
                .totalVat(totalVat)
                .totalTtc(totalTtc)
                .dueDate(LocalDateTime.now().plusDays(15))
                .createdAt(LocalDateTime.now())
                .build();

        if (InvoiceType.GENERAL.equals(invoiceType)) {
            quote.setStatus(QuoteStatus.INVOICED);
            quoteRepositoryPort.save(quote);
        }

        Invoice saved = invoiceRepositoryPort.save(invoice);
        return invoiceMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public InvoiceDTO recordPayment(Long invoiceId, PaymentDTO paymentDTO) {
        Invoice invoice = invoiceRepositoryPort.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Facture introuvable avec l'id: " + invoiceId));
        verifyEventOwnership(invoice.getEventId());

        PaymentMethod method = PaymentMethod.CARD;
        try {
            method = PaymentMethod.valueOf(paymentDTO.getPaymentMethod().toUpperCase());
        } catch (Exception ignored) {}

        Payment payment = Payment.builder()
                .invoiceId(invoiceId)
                .catererId(invoice.getCatererId())
                .amount(paymentDTO.getAmount())
                .paymentDate(LocalDateTime.now())
                .paymentMethod(method)
                .reference(paymentDTO.getReference())
                .label(paymentDTO.getLabel())
                .build();

        invoice.addPayment(payment);
        Invoice saved = invoiceRepositoryPort.save(invoice);
        return invoiceMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteInvoice(Long id) {
        Invoice invoice = invoiceRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture introuvable avec l'id: " + id));
        verifyEventOwnership(invoice.getEventId());

        if (invoice.calculateTotalPaid().compareTo(BigDecimal.ZERO) > 0) {
            throw new IllegalStateException("Impossible de supprimer une facture ayant reçu des règlements.");
        }

        // Si la facture est liée à un devis, remettre le statut du devis à ACCEPTED
        if (invoice.getQuoteId() != null) {
            quoteRepositoryPort.findById(invoice.getQuoteId()).ifPresent(q -> {
                if (QuoteStatus.INVOICED.equals(q.getStatus())) {
                    q.setStatus(QuoteStatus.ACCEPTED);
                    quoteRepositoryPort.save(q);
                }
            });
        }

        invoiceRepositoryPort.deleteById(id);
    }
}
