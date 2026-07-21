package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.MenuItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JpaMenuItemRepository extends JpaRepository<MenuItemEntity, Long> {
    List<MenuItemEntity> findByEventId(Long eventId);
    void deleteByEventId(Long eventId);
}
