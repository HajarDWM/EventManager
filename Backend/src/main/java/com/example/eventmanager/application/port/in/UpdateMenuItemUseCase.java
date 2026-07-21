package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.MenuItemDTO;

public interface UpdateMenuItemUseCase {
    MenuItemDTO updateMenuItem(Long id, MenuItemDTO menuItemDTO);
}
