package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.infrastructure.persistence.entity.EventEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.EventPersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class EventRepositoryAdapter implements EventRepositoryPort {

    private final EventRepository eventRepository;
    private final EventPersistenceMapper eventPersistenceMapper;

    @Override
    public Event save(Event event) {
        EventEntity entity = eventPersistenceMapper.toEntity(event);
        EventEntity savedEntity = eventRepository.save(entity);
        return eventPersistenceMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Event> findById(Long id) {
        return eventRepository.findByIdAndArchivedFalse(id)
                .map(eventPersistenceMapper::toDomain);
    }

    @Override
    public java.util.List<Event> findAllByCatererId(Long catererId) {
        return eventRepository.findByCatererIdAndArchivedFalse(catererId).stream()
                .map(eventPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public void deleteById(Long id) {
        eventRepository.deleteById(id);
    }

    @Override
    public java.util.List<Event> findAll() {
        return eventRepository.findByArchivedFalse().stream()
                .map(eventPersistenceMapper::toDomain)
                .toList();
    }

    @Override
    public long countByCatererId(Long catererId) {
        return eventRepository.countByCatererId(catererId);
    }

    @Override
    public long countByCatererIdAndCreatedAtAfter(Long catererId, java.time.LocalDateTime createdAt) {
        return eventRepository.countByCatererIdAndCreatedAtAfter(catererId, createdAt);
    }
}
