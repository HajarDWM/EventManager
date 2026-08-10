package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.MenuItemDTO;
import com.example.eventmanager.application.mapper.MenuItemMapper;
import com.example.eventmanager.application.port.in.CreateMenuItemUseCase;
import com.example.eventmanager.application.port.in.DeleteMenuItemUseCase;
import com.example.eventmanager.application.port.in.GetMenuItemsByEventUseCase;
import com.example.eventmanager.application.port.in.UpdateMenuItemUseCase;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.MenuItemRepositoryPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.exception.EventNotFoundException;
import com.example.eventmanager.domain.exception.UnauthorizedAccessException;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.MenuItem;
import com.example.eventmanager.domain.model.MenuItemCategory;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MenuItemApplicationService implements CreateMenuItemUseCase, GetMenuItemsByEventUseCase, UpdateMenuItemUseCase, DeleteMenuItemUseCase {

    private final MenuItemRepositoryPort menuItemRepositoryPort;
    private final EventRepositoryPort eventRepositoryPort;
    private final MenuItemMapper menuItemMapper;
    private final SecurityContextPort securityContextPort;

    private void verifyEventOwnership(Long eventId) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        if (event.getCatererId() != null && !event.getCatererId().equals(currentCatererId)) {
            throw new UnauthorizedAccessException("Accès non autorisé à cet événement");
        }
    }

    @Override
    @Transactional
    public MenuItemDTO createMenuItem(Long eventId, MenuItemDTO menuItemDTO) {
        verifyEventOwnership(eventId);
        menuItemDTO.setEventId(eventId);
        MenuItem menuItem = menuItemMapper.toDomain(menuItemDTO);
        MenuItem saved = menuItemRepositoryPort.save(menuItem);
        return menuItemMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getMenuItemsByEventId(Long eventId) {
        verifyEventOwnership(eventId);
        return menuItemRepositoryPort.findByEventId(eventId).stream()
                .map(menuItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getCatererMenuItems() {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        return menuItemRepositoryPort.findAllByCatererId(currentCatererId).stream()
                .map(menuItemMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MenuItemDTO updateMenuItem(Long id, MenuItemDTO menuItemDTO) {
        MenuItem existing = menuItemRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Plat du menu introuvable avec l'id: " + id));
        verifyEventOwnership(existing.getEventId());

        MenuItemCategory categoryEnum = MenuItemCategory.STARTER;
        if (menuItemDTO.getCategory() != null) {
            try {
                categoryEnum = MenuItemCategory.valueOf(menuItemDTO.getCategory().toUpperCase());
            } catch (Exception ignored) {}
        }

        existing.updateDetails(
                menuItemDTO.getName(),
                categoryEnum,
                menuItemDTO.getPricePerPerson(),
                menuItemDTO.getDietaryTag(),
                menuItemDTO.getDescription(),
                menuItemDTO.getImageUrl()
        );

        MenuItem updated = menuItemRepositoryPort.save(existing);
        return menuItemMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteMenuItem(Long id) {
        MenuItem existing = menuItemRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Plat du menu introuvable avec l'id: " + id));
        verifyEventOwnership(existing.getEventId());

        menuItemRepositoryPort.deleteById(id);
    }
}
