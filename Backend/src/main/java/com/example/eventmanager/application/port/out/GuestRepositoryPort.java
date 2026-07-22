package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.Guest;

import java.util.List;
import java.util.Optional;

public interface GuestRepositoryPort {
    Guest save(Guest guest);
    Optional<Guest> findById(Long id);
    List<Guest> findByEventId(Long eventId);
    void deleteById(Long id);
    void deleteByEventId(Long eventId);
    long countByEventId(Long eventId);
    long count();
}
