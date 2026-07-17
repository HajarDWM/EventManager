package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.Event;

import java.util.List;
import java.util.Optional;

public interface EventRepositoryPort {
    Event save(Event event);
    Optional<Event> findById(Long id);
    List<Event> findAllByCatererId(Long catererId);
}
