package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.GuestDTO;

import java.util.List;

public interface GetGuestsByEventUseCase {
    List<GuestDTO> getGuestsByEventId(Long eventId);
}
