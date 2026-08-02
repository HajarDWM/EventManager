package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.QuoteDTO;
import com.example.eventmanager.application.port.in.ManageQuoteUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/events/{eventId}/quotes")
@RequiredArgsConstructor
public class QuoteResource {

    private final ManageQuoteUseCase manageQuoteUseCase;

    @PostMapping
    public ResponseEntity<QuoteDTO> createQuote(@PathVariable Long eventId, @RequestBody QuoteDTO quoteDTO) {
        QuoteDTO created = manageQuoteUseCase.createQuote(eventId, quoteDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<QuoteDTO>> getQuotesByEventId(@PathVariable Long eventId) {
        return ResponseEntity.ok(manageQuoteUseCase.getQuotesByEventId(eventId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuoteDTO> getQuoteById(@PathVariable Long eventId, @PathVariable Long id) {
        return ResponseEntity.ok(manageQuoteUseCase.getQuoteById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuoteDTO> updateQuote(@PathVariable Long eventId, @PathVariable Long id, @RequestBody QuoteDTO quoteDTO) {
        return ResponseEntity.ok(manageQuoteUseCase.updateQuote(id, quoteDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuote(@PathVariable Long eventId, @PathVariable Long id) {
        manageQuoteUseCase.deleteQuote(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/accept")
    public ResponseEntity<QuoteDTO> acceptQuote(@PathVariable Long eventId, @PathVariable Long id) {
        return ResponseEntity.ok(manageQuoteUseCase.acceptQuote(id));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<QuoteDTO> rejectQuote(@PathVariable Long eventId, @PathVariable Long id) {
        return ResponseEntity.ok(manageQuoteUseCase.rejectQuote(id));
    }
}
