package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.PlatformExpenseDTO;
import com.example.eventmanager.application.port.in.ManageExpensesUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/expenses")
@RequiredArgsConstructor
public class PlatformExpenseResource {

    private final ManageExpensesUseCase manageExpensesUseCase;

    @GetMapping
    public ResponseEntity<List<PlatformExpenseDTO>> getAllExpenses() {
        return ResponseEntity.ok(manageExpensesUseCase.getAllExpenses());
    }

    @PostMapping
    public ResponseEntity<PlatformExpenseDTO> createExpense(@RequestBody PlatformExpenseDTO dto) {
        return ResponseEntity.ok(manageExpensesUseCase.createExpense(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlatformExpenseDTO> updateExpense(@PathVariable Long id, @RequestBody PlatformExpenseDTO dto) {
        dto.setId(id);
        return ResponseEntity.ok(manageExpensesUseCase.updateExpense(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        manageExpensesUseCase.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
