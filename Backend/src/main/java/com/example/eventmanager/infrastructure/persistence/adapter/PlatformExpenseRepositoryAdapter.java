package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.port.out.PlatformExpenseRepositoryPort;
import com.example.eventmanager.domain.model.PlatformExpense;
import com.example.eventmanager.infrastructure.persistence.entity.PlatformExpenseEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.PlatformExpensePersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.JpaPlatformExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class PlatformExpenseRepositoryAdapter implements PlatformExpenseRepositoryPort {

    private final JpaPlatformExpenseRepository jpaPlatformExpenseRepository;
    private final PlatformExpensePersistenceMapper mapper;

    @Override
    public PlatformExpense save(PlatformExpense expense) {
        PlatformExpenseEntity entity = mapper.toEntity(expense);
        PlatformExpenseEntity saved = jpaPlatformExpenseRepository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public List<PlatformExpense> findAll() {
        return jpaPlatformExpenseRepository.findAllByOrderByExpenseDateDesc().stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public List<PlatformExpense> findByExpenseDateAfter(LocalDateTime date) {
        return jpaPlatformExpenseRepository.findByExpenseDateAfterOrderByExpenseDateDesc(date).stream()
                .map(mapper::toDomain)
                .toList();
    }

    @Override
    public Optional<PlatformExpense> findById(Long id) {
        return jpaPlatformExpenseRepository.findById(id).map(mapper::toDomain);
    }

    @Override
    public void deleteById(Long id) {
        jpaPlatformExpenseRepository.deleteById(id);
    }
}
