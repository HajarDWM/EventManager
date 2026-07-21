package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.EventTaskDTO;
import com.example.eventmanager.application.port.in.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class EventTaskResource {

    private final CreateEventTaskUseCase createEventTaskUseCase;
    private final GetTasksByEventUseCase getTasksByEventUseCase;
    private final UpdateEventTaskUseCase updateEventTaskUseCase;
    private final DeleteEventTaskUseCase deleteEventTaskUseCase;
    private final ToggleTaskStatusUseCase toggleTaskStatusUseCase;

    @GetMapping("/events/{eventId}/tasks")
    public ResponseEntity<List<EventTaskDTO>> getTasksByEvent(@PathVariable Long eventId) {
        List<EventTaskDTO> tasks = getTasksByEventUseCase.getTasksByEventId(eventId);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/events/{eventId}/tasks")
    public ResponseEntity<EventTaskDTO> createEventTask(@PathVariable Long eventId, @RequestBody EventTaskDTO eventTaskDTO) {
        EventTaskDTO created = createEventTaskUseCase.createEventTask(eventId, eventTaskDTO);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/tasks/{id}")
    public ResponseEntity<EventTaskDTO> updateEventTask(@PathVariable Long id, @RequestBody EventTaskDTO eventTaskDTO) {
        EventTaskDTO updated = updateEventTaskUseCase.updateEventTask(id, eventTaskDTO);
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/tasks/{id}/toggle")
    public ResponseEntity<EventTaskDTO> toggleTaskStatus(@PathVariable Long id) {
        EventTaskDTO updated = toggleTaskStatusUseCase.toggleTaskStatus(id);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/tasks/{id}")
    public ResponseEntity<Void> deleteEventTask(@PathVariable Long id) {
        deleteEventTaskUseCase.deleteEventTask(id);
        return ResponseEntity.noContent().build();
    }
}
