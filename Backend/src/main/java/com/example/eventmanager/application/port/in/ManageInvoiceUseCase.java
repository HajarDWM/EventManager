package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.InvoiceDTO;
import com.example.eventmanager.application.dto.PaymentDTO;
import java.util.List;

public interface ManageInvoiceUseCase {
    InvoiceDTO getInvoiceById(Long id);
    List<InvoiceDTO> getInvoicesByEventId(Long eventId);
    InvoiceDTO generateInvoiceFromQuote(Long quoteId, String type, java.math.BigDecimal percentage);
    InvoiceDTO recordPayment(Long invoiceId, PaymentDTO paymentDTO);
    void deleteInvoice(Long id);
}
