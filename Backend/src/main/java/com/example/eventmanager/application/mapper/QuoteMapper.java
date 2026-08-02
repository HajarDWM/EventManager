package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.QuoteDTO;
import com.example.eventmanager.application.dto.QuoteItemDTO;
import com.example.eventmanager.domain.model.Quote;
import com.example.eventmanager.domain.model.QuoteItem;
import com.example.eventmanager.domain.model.QuoteStatus;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuoteMapper {

    public QuoteDTO toDTO(Quote domain) {
        if (domain == null) return null;
        
        List<QuoteItemDTO> itemDTOs = new ArrayList<>();
        if (domain.getItems() != null) {
            itemDTOs = domain.getItems().stream()
                    .map(this::toItemDTO)
                    .collect(Collectors.toList());
        }

        return QuoteDTO.builder()
                .id(domain.getId())
                .reference(domain.getReference())
                .eventId(domain.getEventId())
                .catererId(domain.getCatererId())
                .items(itemDTOs)
                .status(domain.getStatus() != null ? domain.getStatus().name() : null)
                .taxRate(domain.getTaxRate())
                .totalHt(domain.getTotalHt())
                .totalVat(domain.getTotalVat())
                .totalTtc(domain.getTotalTtc())
                .createdAt(domain.getCreatedAt())
                .validUntil(domain.getValidUntil())
                .build();
    }

    public QuoteItemDTO toItemDTO(QuoteItem item) {
        if (item == null) return null;
        return QuoteItemDTO.builder()
                .id(item.getId())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .build();
    }

    public Quote toDomain(QuoteDTO dto) {
        if (dto == null) return null;

        List<QuoteItem> domainItems = new ArrayList<>();
        if (dto.getItems() != null) {
            domainItems = dto.getItems().stream()
                    .map(this::toItemDomain)
                    .collect(Collectors.toList());
        }

        QuoteStatus quoteStatus = QuoteStatus.DRAFT;
        if (dto.getStatus() != null) {
            try {
                quoteStatus = QuoteStatus.valueOf(dto.getStatus().toUpperCase());
            } catch (Exception ignored) {}
        }

        return Quote.builder()
                .id(dto.getId())
                .reference(dto.getReference())
                .eventId(dto.getEventId())
                .catererId(dto.getCatererId())
                .items(domainItems)
                .status(quoteStatus)
                .taxRate(dto.getTaxRate())
                .totalHt(dto.getTotalHt())
                .totalVat(dto.getTotalVat())
                .totalTtc(dto.getTotalTtc())
                .createdAt(dto.getCreatedAt())
                .validUntil(dto.getValidUntil())
                .build();
    }

    public QuoteItem toItemDomain(QuoteItemDTO itemDTO) {
        if (itemDTO == null) return null;
        return QuoteItem.builder()
                .id(itemDTO.getId())
                .description(itemDTO.getDescription())
                .quantity(itemDTO.getQuantity())
                .unitPrice(itemDTO.getUnitPrice())
                .totalPrice(itemDTO.getTotalPrice())
                .build();
    }
}
