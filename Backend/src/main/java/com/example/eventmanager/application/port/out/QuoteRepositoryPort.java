package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.Quote;
import java.util.List;
import java.util.Optional;

public interface QuoteRepositoryPort {
    Quote save(Quote quote);
    Optional<Quote> findById(Long id);
    Optional<Quote> findByReference(String reference);
    List<Quote> findByCatererId(Long catererId);
    List<Quote> findByEventId(Long eventId);
    void deleteById(Long id);
}
