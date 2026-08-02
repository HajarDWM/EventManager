package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.QuoteDTO;
import java.util.List;

public interface ManageQuoteUseCase {
    QuoteDTO createQuote(Long eventId, QuoteDTO quoteDTO);
    QuoteDTO getQuoteById(Long id);
    List<QuoteDTO> getQuotesByEventId(Long eventId);
    QuoteDTO updateQuote(Long id, QuoteDTO quoteDTO);
    void deleteQuote(Long id);
    QuoteDTO acceptQuote(Long id);
    QuoteDTO rejectQuote(Long id);
}
