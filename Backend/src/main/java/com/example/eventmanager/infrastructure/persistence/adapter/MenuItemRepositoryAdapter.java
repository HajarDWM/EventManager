package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.mapper.MenuItemMapper;
import com.example.eventmanager.application.port.out.MenuItemRepositoryPort;
import com.example.eventmanager.domain.model.MenuItem;
import com.example.eventmanager.infrastructure.persistence.entity.MenuItemEntity;
import com.example.eventmanager.infrastructure.persistence.repository.JpaMenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class MenuItemRepositoryAdapter implements MenuItemRepositoryPort {

    private final JpaMenuItemRepository jpaMenuItemRepository;
    private final MenuItemMapper menuItemMapper;

    @Override
    public MenuItem save(MenuItem menuItem) {
        MenuItemEntity entity = menuItemMapper.toEntity(menuItem);
        MenuItemEntity saved = jpaMenuItemRepository.save(entity);
        return menuItemMapper.toDomainFromEntity(saved);
    }

    @Override
    public Optional<MenuItem> findById(Long id) {
        return jpaMenuItemRepository.findById(id)
                .map(menuItemMapper::toDomainFromEntity);
    }

    @Override
    public List<MenuItem> findByEventId(Long eventId) {
        return jpaMenuItemRepository.findByEventId(eventId).stream()
                .map(menuItemMapper::toDomainFromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteById(Long id) {
        jpaMenuItemRepository.deleteById(id);
    }

    @Override
    public void deleteByEventId(Long eventId) {
        jpaMenuItemRepository.deleteByEventId(eventId);
    }
}
