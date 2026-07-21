package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.MenuItemDTO;

public interface CreateMenuItemUseCase {
    MenuItemDTO createMenuItem(Long eventId, MenuItemDTO menuItemDTO);
}
