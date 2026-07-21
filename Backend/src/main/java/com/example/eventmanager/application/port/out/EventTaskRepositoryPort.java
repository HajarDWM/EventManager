package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.EventTask;

import java.util.List;
import java.util.Optional;

public interface EventTaskRepositoryPort {
    EventTask save(EventTask eventTask);
    Optional<EventTask> findById(Long id);
    List<EventTask> findByEventId(Long eventId);
    void deleteById(Long id);
    void deleteByEventId(Long eventId);
}
