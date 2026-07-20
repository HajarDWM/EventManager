package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.GuestDTO;

public interface CreateGuestUseCase {
    GuestDTO createGuest(Long eventId, GuestDTO guestDTO);
}
