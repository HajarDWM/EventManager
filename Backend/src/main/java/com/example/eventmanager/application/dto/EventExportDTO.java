package com.example.eventmanager.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventExportDTO {
    private EventDTO event;
    private List<GuestDTO> guests;
    private List<MenuItemDTO> menuItems;
    private List<EventTaskDTO> tasks;
}
