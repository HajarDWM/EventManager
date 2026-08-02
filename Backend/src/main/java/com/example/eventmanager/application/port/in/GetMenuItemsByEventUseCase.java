package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.MenuItemDTO;

import java.util.List;

public interface GetMenuItemsByEventUseCase {
    List<MenuItemDTO> getMenuItemsByEventId(Long eventId);
    List<MenuItemDTO> getCatererMenuItems();
}
