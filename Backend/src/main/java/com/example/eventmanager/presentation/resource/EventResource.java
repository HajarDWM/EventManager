package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.EventDTO;
import com.example.eventmanager.application.port.in.CreateEventUseCase;
import com.example.eventmanager.application.port.in.GetEventUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventResource {

    private final CreateEventUseCase createEventUseCase;
    private final GetEventUseCase getEventUseCase;

    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@RequestBody EventDTO eventDTO) {
        EventDTO createdEvent = createEventUseCase.createEvent(eventDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventDTO> getEventById(@PathVariable Long id) {
        EventDTO eventDTO = getEventUseCase.getEventById(id);
        return ResponseEntity.ok(eventDTO);
    }

    @GetMapping
    public ResponseEntity<java.util.List<EventDTO>> getAllEvents() {
        return ResponseEntity.ok(getEventUseCase.getAllEvents());
    }
}
