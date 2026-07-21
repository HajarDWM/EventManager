package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.MenuItem;

import java.util.List;
import java.util.Optional;

public interface MenuItemRepositoryPort {
    MenuItem save(MenuItem menuItem);
    Optional<MenuItem> findById(Long id);
    List<MenuItem> findByEventId(Long eventId);
    void deleteById(Long id);
    void deleteByEventId(Long eventId);
}
