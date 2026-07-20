package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.GuestDTO;

public interface UpdateGuestUseCase {
    GuestDTO updateGuest(Long guestId, GuestDTO guestDTO);
}
