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
import com.example.eventmanager.infrastructure.persistence.repository.CatererRepository;

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
    private final CatererRepository catererRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String token = request.get("accessLinkToken");
        if (token == null || token.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "MISSING_TOKEN", "message", "Le jeton d'accès est obligatoire."));
        }

        var clientOpt = clientRepository.findByAccessLinkToken(token);
        if (clientOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "INVALID_TOKEN", "message", "Jeton d'accès introuvable ou invalide."));
        }

        var client = clientOpt.get();
        if (client.getAccessLinkExpiresAt() != null && java.time.LocalDateTime.now().isAfter(client.getAccessLinkExpiresAt())) {
            return ResponseEntity.status(401).body(Map.of(
                "error", "TOKEN_EXPIRED",
                "message", "Ce lien d'accès a expiré (clôturé 7 jours après la date de l'événement). Veuillez contacter votre organisateur pour obtenir un nouveau lien.",
                "expiredAt", client.getAccessLinkExpiresAt().toString()
            ));
        }

        var jwtOpt = clientAuthService.authenticate(token);
        if (jwtOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "UNAUTHORIZED", "message", "Authentification échouée."));
        }

        var jwt = jwtOpt.get();
        List<EventEntity> events = eventRepository.findByClientId(client.getId());
        List<EventDTO> eventDTOs = events.stream()
                .map(eventPersistenceMapper::toDomain)
                .map(event -> {
                    EventDTO dto = eventMapper.toDTO(event);
                    if (event.getCatererId() != null) {
                        catererRepository.findById(event.getCatererId())
                                .ifPresent(caterer -> {
                                    dto.setCatererName(caterer.getBusinessName());
                                    dto.setCatererEmail(caterer.getEmail());
                                });
                    }
                    
                    dto.setClientName(client.getName());
                    dto.setClientEmail(client.getEmail());
                    dto.setClientPhone(client.getPhone());
                    dto.setAccessLinkExpiresAt(client.getAccessLinkExpiresAt());
                    
                    return dto;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ClientAuthResponse(jwt.getToken(), eventDTOs));
    }

    @Data
    public static class ClientAuthResponse {
        private final String token;
        private final List<EventDTO> events;
    }
}
