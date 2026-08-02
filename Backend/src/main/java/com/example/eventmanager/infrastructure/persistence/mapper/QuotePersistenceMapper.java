package com.example.eventmanager.infrastructure.persistence.mapper;

import com.example.eventmanager.domain.model.Quote;
import com.example.eventmanager.domain.model.QuoteItem;
import com.example.eventmanager.domain.model.QuoteStatus;
import com.example.eventmanager.infrastructure.persistence.entity.QuoteEntity;
import com.example.eventmanager.infrastructure.persistence.entity.QuoteItemEntity;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuotePersistenceMapper {

    public QuoteEntity toEntity(Quote domain) {
        if (domain == null) return null;

        QuoteEntity entity = QuoteEntity.builder()
                .id(domain.getId())
                .reference(domain.getReference())
                .eventId(domain.getEventId())
                .catererId(domain.getCatererId())
                .status(domain.getStatus() != null ? domain.getStatus().name() : "DRAFT")
                .taxRate(domain.getTaxRate())
                .totalHt(domain.getTotalHt())
                .totalVat(domain.getTotalVat())
                .totalTtc(domain.getTotalTtc())
                .createdAt(domain.getCreatedAt())
                .validUntil(domain.getValidUntil())
                .build();

        if (domain.getItems() != null) {
            List<QuoteItemEntity> itemEntities = domain.getItems().stream()
                    .map(item -> toItemEntity(item, entity))
                    .collect(Collectors.toList());
            entity.setItems(itemEntities);
        }

        return entity;
    }

    public QuoteItemEntity toItemEntity(QuoteItem item, QuoteEntity quoteEntity) {
        if (item == null) return null;
        return QuoteItemEntity.builder()
                .id(item.getId())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unitPrice(item.getUnitPrice())
                .totalPrice(item.getTotalPrice())
                .quote(quoteEntity)
                .build();
    }

    public Quote toDomain(QuoteEntity entity) {
        if (entity == null) return null;

        QuoteStatus statusEnum = QuoteStatus.DRAFT;
        if (entity.getStatus() != null) {
            try {
                statusEnum = QuoteStatus.valueOf(entity.getStatus().toUpperCase());
            } catch (Exception ignored) {}
        }

        Quote domain = Quote.builder()
                .id(entity.getId())
                .reference(entity.getReference())
                .eventId(entity.getEventId())
                .catererId(entity.getCatererId())
                .status(statusEnum)
                .taxRate(entity.getTaxRate())
                .totalHt(entity.getTotalHt())
                .totalVat(entity.getTotalVat())
                .totalTtc(entity.getTotalTtc())
                .createdAt(entity.getCreatedAt())
                .validUntil(entity.getValidUntil())
                .build();

        if (entity.getItems() != null) {
            List<QuoteItem> domainItems = entity.getItems().stream()
                    .map(this::toItemDomain)
                    .collect(Collectors.toList());
            domain.setItems(domainItems);
        }

        return domain;
    }

    public QuoteItem toItemDomain(QuoteItemEntity entity) {
        if (entity == null) return null;
        return QuoteItem.builder()
                .id(entity.getId())
                .description(entity.getDescription())
                .quantity(entity.getQuantity())
                .unitPrice(entity.getUnitPrice())
                .totalPrice(entity.getTotalPrice())
                .build();
    }
}
