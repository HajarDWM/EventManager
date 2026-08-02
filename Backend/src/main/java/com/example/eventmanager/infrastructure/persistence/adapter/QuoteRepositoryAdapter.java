package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.port.out.QuoteRepositoryPort;
import com.example.eventmanager.domain.model.Quote;
import com.example.eventmanager.infrastructure.persistence.entity.QuoteEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.QuotePersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.QuoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class QuoteRepositoryAdapter implements QuoteRepositoryPort {

    private final QuoteRepository quoteRepository;
    private final QuotePersistenceMapper quotePersistenceMapper;

    @Override
    public Quote save(Quote quote) {
        QuoteEntity entity = quotePersistenceMapper.toEntity(quote);
        QuoteEntity saved = quoteRepository.save(entity);
        return quotePersistenceMapper.toDomain(saved);
    }

    @Override
    public Optional<Quote> findById(Long id) {
        return quoteRepository.findById(id)
                .map(quotePersistenceMapper::toDomain);
    }

    @Override
    public Optional<Quote> findByReference(String reference) {
        return quoteRepository.findByReference(reference)
                .map(quotePersistenceMapper::toDomain);
    }

    @Override
    public List<Quote> findByCatererId(Long catererId) {
        return quoteRepository.findByCatererId(catererId).stream()
                .map(quotePersistenceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public List<Quote> findByEventId(Long eventId) {
        return quoteRepository.findByEventId(eventId).stream()
                .map(quotePersistenceMapper::toDomain)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        quoteRepository.deleteById(id);
    }
}
