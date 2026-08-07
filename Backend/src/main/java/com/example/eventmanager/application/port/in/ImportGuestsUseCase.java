package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.GuestDTO;
import java.io.InputStream;
import java.util.List;

public interface ImportGuestsUseCase {
    List<GuestDTO> importGuests(Long eventId, InputStream fileInputStream, String filename);
}
