package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.mapper.EventTaskMapper;
import com.example.eventmanager.application.port.out.EventTaskRepositoryPort;
import com.example.eventmanager.domain.model.EventTask;
import com.example.eventmanager.infrastructure.persistence.entity.EventTaskEntity;
import com.example.eventmanager.infrastructure.persistence.repository.JpaEventTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class EventTaskRepositoryAdapter implements EventTaskRepositoryPort {

    private final JpaEventTaskRepository jpaEventTaskRepository;
    private final EventTaskMapper eventTaskMapper;

    @Override
    public EventTask save(EventTask eventTask) {
        EventTaskEntity entity = eventTaskMapper.toEntity(eventTask);
        EventTaskEntity saved = jpaEventTaskRepository.save(entity);
        return eventTaskMapper.toDomainFromEntity(saved);
    }

    @Override
    public Optional<EventTask> findById(Long id) {
        return jpaEventTaskRepository.findById(id)
                .map(eventTaskMapper::toDomainFromEntity);
    }

    @Override
    public List<EventTask> findByEventId(Long eventId) {
        return jpaEventTaskRepository.findByEventId(eventId).stream()
                .map(eventTaskMapper::toDomainFromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaEventTaskRepository.deleteById(id);
    }

    @Override
    public void deleteByEventId(Long eventId) {
        jpaEventTaskRepository.deleteByEventId(eventId);
    }
}
