package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.EventDTO;
import com.example.eventmanager.application.mapper.EventMapper;
import com.example.eventmanager.infrastructure.persistence.entity.EventEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.EventPersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.EventRepository;
import com.example.eventmanager.infrastructure.security.model.ClientUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/client/events")
@RequiredArgsConstructor
public class ClientEventController {

    private final EventRepository eventRepository;
    private final EventPersistenceMapper eventPersistenceMapper;
    private final EventMapper eventMapper;

    @GetMapping
    public ResponseEntity<List<EventDTO>> getClientEvents(@AuthenticationPrincipal ClientUserDetails clientDetails) {
        if (clientDetails == null) {
            return ResponseEntity.status(401).build();
        }

        List<EventEntity> events = eventRepository.findByClientId(clientDetails.getClientId());
        List<EventDTO> eventDTOs = events.stream()
                .map(eventPersistenceMapper::toDomain)
                .map(eventMapper::toDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(eventDTOs);
    }
}
