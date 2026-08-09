package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.port.out.EventExpenseRepositoryPort;
import com.example.eventmanager.domain.model.EventExpense;
import com.example.eventmanager.infrastructure.persistence.entity.EventExpenseEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.EventExpensePersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.JpaEventExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class EventExpenseRepositoryAdapter implements EventExpenseRepositoryPort {

    private final JpaEventExpenseRepository jpaEventExpenseRepository;
    private final EventExpensePersistenceMapper mapper;

    @Override
    public EventExpense save(EventExpense expense) {
        EventExpenseEntity entity = mapper.toEntity(expense);
        EventExpenseEntity saved = jpaEventExpenseRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public List<EventExpense> findByEventId(Long eventId) {
        return jpaEventExpenseRepository.findByEventIdOrderByExpenseDateDesc(eventId).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<EventExpense> findById(Long id) {
        return jpaEventExpenseRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public void deleteById(Long id) {
        jpaEventExpenseRepository.deleteById(id);
    }
}
