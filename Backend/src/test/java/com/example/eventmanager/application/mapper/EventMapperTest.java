package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.EventDTO;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.EventStatus;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class EventMapperTest {

    private final EventMapper eventMapper = new EventMapper();

    @Test
    void toDomain_ShouldMapDTOToDomain() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        EventDTO dto = EventDTO.builder()
                .id(1L)
                .title("Conference")
                .eventDate(now)
                .location("Lyon")
                .guestCount(500)
                .status("PLANNED")
                .catererId(2L)
                .build();

        // Act
        Event event = eventMapper.toDomain(dto);

        // Assert
        assertNotNull(event);
        assertEquals(1L, event.getId());
        assertEquals("Conference", event.getTitle());
        assertEquals(now, event.getEventDate());
        assertEquals("Lyon", event.getLocation());
        assertEquals(500, event.getGuestCount());
        assertEquals(EventStatus.PLANNED, event.getStatus());
        assertEquals(2L, event.getCatererId());
    }

    @Test
    void toDomain_ShouldReturnNull_WhenDTOIsNull() {
        assertNull(eventMapper.toDomain(null));
    }

    @Test
    void toDTO_ShouldMapDomainToDTO() {
        // Arrange
        LocalDateTime now = LocalDateTime.now();
        Event event = Event.builder()
                .id(1L)
                .title("Conference")
                .eventDate(now)
                .location("Lyon")
                .guestCount(500)
                .status(EventStatus.COMPLETED)
                .catererId(2L)
                .build();

        // Act
        EventDTO dto = eventMapper.toDTO(event);

        // Assert
        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("Conference", dto.getTitle());
        assertEquals(now, dto.getEventDate());
        assertEquals("Lyon", dto.getLocation());
        assertEquals(500, dto.getGuestCount());
        assertEquals("COMPLETED", dto.getStatus());
        assertEquals(2L, dto.getCatererId());
    }

    @Test
    void toDTO_ShouldReturnNull_WhenDomainIsNull() {
        assertNull(eventMapper.toDTO(null));
    }
}
