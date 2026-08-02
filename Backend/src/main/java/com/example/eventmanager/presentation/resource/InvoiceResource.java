package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.InvoiceDTO;
import com.example.eventmanager.application.dto.PaymentDTO;
import com.example.eventmanager.application.port.in.ManageInvoiceUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/invoices")
@RequiredArgsConstructor
public class InvoiceResource {

    private final ManageInvoiceUseCase manageInvoiceUseCase;

    @GetMapping
    public ResponseEntity<List<InvoiceDTO>> getInvoicesByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(manageInvoiceUseCase.getInvoicesByEventId(eventId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InvoiceDTO> getInvoiceById(@PathVariable Long eventId, @PathVariable Long id) {
        return ResponseEntity.ok(manageInvoiceUseCase.getInvoiceById(id));
    }

    @PostMapping("/generate")
    public ResponseEntity<InvoiceDTO> generateInvoiceFromQuote(
            @PathVariable Long eventId,
            @RequestParam Long quoteId,
            @RequestParam String type,
            @RequestParam(required = false) BigDecimal percentage
    ) {
        InvoiceDTO created = manageInvoiceUseCase.generateInvoiceFromQuote(quoteId, type, percentage);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/payments")
    public ResponseEntity<InvoiceDTO> recordPayment(
            @PathVariable Long eventId,
            @PathVariable Long id,
            @RequestBody PaymentDTO paymentDTO
    ) {
        InvoiceDTO updated = manageInvoiceUseCase.recordPayment(id, paymentDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long eventId, @PathVariable Long id) {
        manageInvoiceUseCase.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }
}
