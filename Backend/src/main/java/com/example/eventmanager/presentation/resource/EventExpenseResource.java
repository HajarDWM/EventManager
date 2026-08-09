package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.EventExpenseDTO;
import com.example.eventmanager.application.port.in.ManageEventExpensesUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/expenses")
@RequiredArgsConstructor
public class EventExpenseResource {

    private final ManageEventExpensesUseCase manageEventExpensesUseCase;

    @GetMapping
    public ResponseEntity<List<EventExpenseDTO>> getExpensesByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(manageEventExpensesUseCase.getExpensesByEventId(eventId));
    }

    @PostMapping
    public ResponseEntity<EventExpenseDTO> addExpense(
            @PathVariable Long eventId,
            @RequestBody EventExpenseDTO dto
    ) {
        EventExpenseDTO created = manageEventExpensesUseCase.addExpense(eventId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{expenseId}")
    public ResponseEntity<EventExpenseDTO> updateExpense(
            @PathVariable Long eventId,
            @PathVariable Long expenseId,
            @RequestBody EventExpenseDTO dto
    ) {
        EventExpenseDTO updated = manageEventExpensesUseCase.updateExpense(eventId, expenseId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Long eventId,
            @PathVariable Long expenseId
    ) {
        manageEventExpensesUseCase.deleteExpense(eventId, expenseId);
        return ResponseEntity.noContent().build();
    }
}
