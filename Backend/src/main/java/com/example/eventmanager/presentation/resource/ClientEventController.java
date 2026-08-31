package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.EventDTO;
import com.example.eventmanager.application.mapper.EventMapper;
import com.example.eventmanager.infrastructure.persistence.entity.EventEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.EventPersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.EventRepository;
import com.example.eventmanager.infrastructure.security.model.ClientUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.eventmanager.infrastructure.persistence.repository.QuoteRepository;
import com.example.eventmanager.infrastructure.persistence.repository.InvoiceRepository;
import com.example.eventmanager.infrastructure.persistence.entity.QuoteEntity;
import com.example.eventmanager.infrastructure.persistence.entity.InvoiceEntity;
import com.example.eventmanager.infrastructure.persistence.entity.PaymentEntity;
import com.example.eventmanager.infrastructure.persistence.repository.DigitalInvitationTemplateRepository;
import com.example.eventmanager.infrastructure.persistence.entity.DigitalInvitationTemplateEntity;
import java.math.BigDecimal;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/client/events")
@RequiredArgsConstructor
public class ClientEventController {

    private final EventRepository eventRepository;
    private final EventPersistenceMapper eventPersistenceMapper;
    private final EventMapper eventMapper;
    private final QuoteRepository quoteRepository;
    private final InvoiceRepository invoiceRepository;
    private final DigitalInvitationTemplateRepository templateRepository;

    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<List<EventDTO>> getClientEvents(@AuthenticationPrincipal ClientUserDetails clientDetails) {
        if (clientDetails == null) {
            return ResponseEntity.status(401).build();
        }

        List<EventEntity> events = eventRepository.findByClientId(clientDetails.getClientId());
        List<EventDTO> eventDTOs = events.stream()
                .map(eventPersistenceMapper::toDomain)
                .map(event -> {
                    EventDTO dto = eventMapper.toDTO(event);
                    
                    // Dynamic Calculation Alignment
                    List<QuoteEntity> quotes = quoteRepository.findByEventId(event.getId());
                    QuoteEntity globalQuote = quotes.stream()
                        .filter(q -> (q.getReference() != null && q.getReference().startsWith("QT-GLOBAL-")) 
                                || "ACCEPTED".equals(q.getStatus()) || "INVOICED".equals(q.getStatus()))
                        .findFirst()
                        .orElse(quotes.isEmpty() ? null : quotes.get(0));

                    double totalContract = 0.0;
                    if (globalQuote != null && globalQuote.getTotalTtc() != null) {
                        totalContract = globalQuote.getTotalTtc().doubleValue();
                    }

                    List<InvoiceEntity> invoices = invoiceRepository.findByEventId(event.getId());
                    InvoiceEntity globalInvoice = invoices.isEmpty() ? null : invoices.get(0);

                    double depositsPaid = 0.0;
                    if (globalInvoice != null && globalInvoice.getPayments() != null) {
                        depositsPaid = globalInvoice.getPayments().stream()
                            .map(PaymentEntity::getAmount)
                            .filter(java.util.Objects::nonNull)
                            .mapToDouble(BigDecimal::doubleValue)
                            .sum();
                    }

                    double balanceDue = totalContract - depositsPaid;
                    if (balanceDue < 0) balanceDue = 0.0;

                    dto.setTotalContractAmount(totalContract);
                    dto.setDepositsPaid(depositsPaid);
                    dto.setBalanceDue(balanceDue);

                    if (event.getDigitalTemplateId() != null) {
                        templateRepository.findById(event.getDigitalTemplateId())
                                .ifPresent(template -> dto.setTemplateBackgroundImageUrl(template.getBackgroundImageUrl()));
                    }
                    
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(eventDTOs);
    }
}
