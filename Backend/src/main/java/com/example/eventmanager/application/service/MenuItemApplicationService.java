package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.MenuItemDTO;
import com.example.eventmanager.application.mapper.MenuItemMapper;
import com.example.eventmanager.application.port.in.CreateMenuItemUseCase;
import com.example.eventmanager.application.port.in.DeleteMenuItemUseCase;
import com.example.eventmanager.application.port.in.GetMenuItemsByEventUseCase;
import com.example.eventmanager.application.port.in.UpdateMenuItemUseCase;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.MenuItemRepositoryPort;
import com.example.eventmanager.application.port.out.GuestRepositoryPort;
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
    private final GuestRepositoryPort guestRepositoryPort;
    private final com.example.eventmanager.application.port.out.CatererRepositoryPort catererRepositoryPort;
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

    private void verifyActiveSubscription() {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        com.example.eventmanager.domain.model.Caterer caterer = catererRepositoryPort.findById(currentCatererId).orElse(null);
        if (caterer != null && caterer.getRole() != com.example.eventmanager.domain.model.CatererRole.SUPER_ADMIN) {
            java.time.LocalDateTime now = java.time.LocalDateTime.now();
            boolean isExpired = false;
            if (!"FREE".equalsIgnoreCase(caterer.getSubscriptionPlan())) {
                java.time.LocalDateTime endDate = caterer.getSubscriptionEndDate();
                if (endDate != null && now.isAfter(endDate.plusDays(10))) {
                    isExpired = true;
                } else if ("EXPIRED".equalsIgnoreCase(caterer.getSubscriptionStatus())) {
                    isExpired = true;
                }
            }
            if (isExpired) {
                throw new UnauthorizedAccessException(
                    "Abonnement expiré — Mode consultation uniquement. La modification des plats est restreinte. Veuillez renouveler votre abonnement."
                );
            }
        }
    }

    @Override
    @Transactional
    public MenuItemDTO createMenuItem(Long eventId, MenuItemDTO menuItemDTO) {
        verifyEventOwnership(eventId);
        verifyActiveSubscription();
        menuItemDTO.setEventId(eventId);
        MenuItem menuItem = menuItemMapper.toDomain(menuItemDTO);
        MenuItem saved = menuItemRepositoryPort.save(menuItem);
        return menuItemMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MenuItemDTO> getMenuItemsByEventId(Long eventId) {
        verifyEventOwnership(eventId);
        List<MenuItemDTO> items = menuItemRepositoryPort.findByEventId(eventId).stream()
                .map(menuItemMapper::toDTO)
                .collect(Collectors.toList());

        List<com.example.eventmanager.domain.model.Guest> guests = guestRepositoryPort.findByEventId(eventId);
        
        for (MenuItemDTO item : items) {
            long count = guests.stream()
                .filter(g -> g.getStatus() == com.example.eventmanager.domain.model.GuestStatus.CONFIRMED)
                .filter(g -> g.getDietaryRequirements() != null && g.getDietaryRequirements().toLowerCase().contains(item.getName().toLowerCase()))
                .count();
            item.setSelectedCount((int) count);
        }
        
        return items;
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
        verifyActiveSubscription();

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
        verifyActiveSubscription();

        menuItemRepositoryPort.deleteById(id);
    }
}
