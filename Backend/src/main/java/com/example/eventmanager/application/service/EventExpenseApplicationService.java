package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.EventExpenseDTO;
import com.example.eventmanager.application.mapper.EventExpenseMapper;
import com.example.eventmanager.application.port.in.ManageEventExpensesUseCase;
import com.example.eventmanager.application.port.out.EventExpenseRepositoryPort;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.exception.EventNotFoundException;
import com.example.eventmanager.domain.exception.UnauthorizedAccessException;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.EventExpense;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventExpenseApplicationService implements ManageEventExpensesUseCase {

    private final EventExpenseRepositoryPort eventExpenseRepositoryPort;
    private final EventRepositoryPort eventRepositoryPort;
    private final SecurityContextPort securityContextPort;
    private final EventExpenseMapper eventExpenseMapper;

    private void verifyEventOwnership(Long eventId) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        if (event.getCatererId() != null && !event.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Accès non autorisé à cet événement");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<EventExpenseDTO> getExpensesByEventId(Long eventId) {
        verifyEventOwnership(eventId);
        return eventExpenseRepositoryPort.findByEventId(eventId).stream()
                .map(eventExpenseMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public EventExpenseDTO addExpense(Long eventId, EventExpenseDTO dto) {
        verifyEventOwnership(eventId);
        EventExpense expense = eventExpenseMapper.toDomain(dto);
        expense.setEventId(eventId);
        if (expense.getExpenseDate() == null) {
            expense.setExpenseDate(LocalDateTime.now());
        }
        EventExpense saved = eventExpenseRepositoryPort.save(expense);
        return eventExpenseMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public EventExpenseDTO updateExpense(Long eventId, Long expenseId, EventExpenseDTO dto) {
        verifyEventOwnership(eventId);
        EventExpense existing = eventExpenseRepositoryPort.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Dépense introuvable avec l'id: " + expenseId));

        if (!existing.getEventId().equals(eventId)) {
            throw new UnauthorizedAccessException("Cette dépense n'appartient pas à l'événement spécifié");
        }

        existing.setCategory(dto.getCategory());
        existing.setDescription(dto.getDescription());
        existing.setAmount(dto.getAmount());
        existing.setProviderName(dto.getProviderName());
        if (dto.getExpenseDate() != null) {
            existing.setExpenseDate(dto.getExpenseDate());
        }

        EventExpense saved = eventExpenseRepositoryPort.save(existing);
        return eventExpenseMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteExpense(Long eventId, Long expenseId) {
        verifyEventOwnership(eventId);
        EventExpense existing = eventExpenseRepositoryPort.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Dépense introuvable avec l'id: " + expenseId));

        if (!existing.getEventId().equals(eventId)) {
            throw new UnauthorizedAccessException("Cette dépense n'appartient pas à l'événement spécifié");
        }

        eventExpenseRepositoryPort.deleteById(expenseId);
    }
}
