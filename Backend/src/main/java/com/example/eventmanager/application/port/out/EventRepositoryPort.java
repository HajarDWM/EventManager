package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.Event;

import java.util.List;
import java.util.Optional;

public interface EventRepositoryPort {
    Event save(Event event);
    Optional<Event> findById(Long id);
    List<Event> findAllByCatererId(Long catererId);
    void deleteById(Long id);
    List<Event> findAll();
    long countByCatererId(Long catererId);
    long countByCatererIdAndCreatedAtAfter(Long catererId, java.time.LocalDateTime createdAt);
}
