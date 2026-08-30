package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.EventDTO;
import com.example.eventmanager.application.mapper.EventMapper;
import com.example.eventmanager.application.service.ClientAuthService;
import com.example.eventmanager.domain.model.JwtToken;
import com.example.eventmanager.infrastructure.persistence.entity.EventEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.EventPersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.EventRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/client/auth")
@RequiredArgsConstructor
public class ClientAuthController {

    private final ClientAuthService clientAuthService;
    private final EventRepository eventRepository;
    private final EventPersistenceMapper eventPersistenceMapper;
    private final EventMapper eventMapper;
    private final com.example.eventmanager.infrastructure.persistence.repository.ClientRepository clientRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String token = request.get("accessLinkToken");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body("Token is required");
        }

        return clientAuthService.authenticate(token)
                .map(jwt -> {
                    com.example.eventmanager.infrastructure.persistence.entity.ClientEntity client = clientRepository.findByAccessLinkToken(token).orElseThrow();
                    List<EventEntity> events = eventRepository.findByClientId(client.getId());
                    List<EventDTO> eventDTOs = events.stream()
                            .map(eventPersistenceMapper::toDomain)
                            .map(eventMapper::toDTO)
                            .collect(Collectors.toList());

                    return ResponseEntity.ok(new ClientAuthResponse(jwt.getToken(), eventDTOs));
                })
                .orElseGet(() -> ResponseEntity.status(401).body((ClientAuthResponse) null));
    }

    @Data
    public static class ClientAuthResponse {
        private final String token;
        private final List<EventDTO> events;
    }
}
