package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.MenuItemDTO;
import com.example.eventmanager.application.port.in.CreateMenuItemUseCase;
import com.example.eventmanager.application.port.in.DeleteMenuItemUseCase;
import com.example.eventmanager.application.port.in.GetMenuItemsByEventUseCase;
import com.example.eventmanager.application.port.in.UpdateMenuItemUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class MenuItemResource {

    private final CreateMenuItemUseCase createMenuItemUseCase;
    private final GetMenuItemsByEventUseCase getMenuItemsByEventUseCase;
    private final UpdateMenuItemUseCase updateMenuItemUseCase;
    private final DeleteMenuItemUseCase deleteMenuItemUseCase;

    @GetMapping("/events/{eventId}/menu-items")
    public ResponseEntity<List<MenuItemDTO>> getMenuItemsByEvent(@PathVariable Long eventId) {
        List<MenuItemDTO> items = getMenuItemsByEventUseCase.getMenuItemsByEventId(eventId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/menu-items")
    public ResponseEntity<?> getCatererMenuItems() {
        try {
            List<MenuItemDTO> items = getMenuItemsByEventUseCase.getCatererMenuItems();
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            e.printStackTrace(pw);
            return ResponseEntity.status(500).body(java.util.Map.of(
                "error", e.getMessage() != null ? e.getMessage() : e.getClass().getName(),
                "stack", sw.toString()
            ));
        }
    }

    @PostMapping("/events/{eventId}/menu-items")
    public ResponseEntity<MenuItemDTO> createMenuItem(@PathVariable Long eventId, @RequestBody MenuItemDTO menuItemDTO) {
        MenuItemDTO created = createMenuItemUseCase.createMenuItem(eventId, menuItemDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/menu-items/{id}")
    public ResponseEntity<MenuItemDTO> updateMenuItem(@PathVariable Long id, @RequestBody MenuItemDTO menuItemDTO) {
        MenuItemDTO updated = updateMenuItemUseCase.updateMenuItem(id, menuItemDTO);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/menu-items/{id}")
    public ResponseEntity<Void> deleteMenuItem(@PathVariable Long id) {
        deleteMenuItemUseCase.deleteMenuItem(id);
        return ResponseEntity.noContent().build();
    }
}
