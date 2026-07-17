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
        return eventRepository.findById(id)
                .map(eventPersistenceMapper::toDomain);
    }
}
