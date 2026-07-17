package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.EventDTO;
import com.example.eventmanager.application.mapper.EventMapper;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.domain.exception.EventNotFoundException;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.EventStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventApplicationServiceTest {

    @Mock
    private EventRepositoryPort eventRepositoryPort;

    @Mock
    private EventMapper eventMapper;

    @InjectMocks
    private EventApplicationService eventApplicationService;

    private EventDTO eventDTO;
    private Event event;

    @BeforeEach
    void setUp() {
        eventDTO = EventDTO.builder()
                .title("Mariage test")
                .eventDate(LocalDateTime.now())
                .location("Paris")
                .guestCount(100)
                .catererId(1L)
                .build();

        event = Event.builder()
                .id(1L)
                .title("Mariage test")
                .eventDate(LocalDateTime.now())
                .location("Paris")
                .guestCount(100)
                .catererId(1L)
                .status(EventStatus.DRAFT)
                .build();
    }

    @Test
    void createEvent_ShouldSetStatusToDraft_WhenStatusIsNull() {
        // Arrange
        when(eventMapper.toDomain(eventDTO)).thenReturn(event);
        when(eventRepositoryPort.save(any(Event.class))).thenReturn(event);
        
        EventDTO returnedDTO = EventDTO.builder().id(1L).status("DRAFT").build();
        when(eventMapper.toDTO(event)).thenReturn(returnedDTO);

        // Act
        EventDTO result = eventApplicationService.createEvent(eventDTO);

        // Assert
        assertNotNull(result);
        assertEquals("DRAFT", result.getStatus());
        verify(eventRepositoryPort, times(1)).save(event);
        assertEquals(EventStatus.DRAFT, event.getStatus());
    }

    @Test
    void getEventById_ShouldReturnEvent_WhenEventExists() {
        // Arrange
        when(eventRepositoryPort.findById(1L)).thenReturn(Optional.of(event));
        when(eventMapper.toDTO(event)).thenReturn(eventDTO);

        // Act
        EventDTO result = eventApplicationService.getEventById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("Mariage test", result.getTitle());
        verify(eventRepositoryPort, times(1)).findById(1L);
    }

    @Test
    void getEventById_ShouldThrowException_WhenEventDoesNotExist() {
        // Arrange
        when(eventRepositoryPort.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EventNotFoundException.class, () -> eventApplicationService.getEventById(99L));
        verify(eventRepositoryPort, times(1)).findById(99L);
    }
}
