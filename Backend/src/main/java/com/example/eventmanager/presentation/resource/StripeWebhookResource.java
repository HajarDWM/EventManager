package com.example.eventmanager.presentation.resource;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks")
@RequiredArgsConstructor
public class StripeWebhookResource {

    private final com.example.eventmanager.application.port.out.CatererRepositoryPort catererRepositoryPort;

    @PostMapping("/stripe")
    public ResponseEntity<Void> handleStripeWebhook(@RequestBody Map<String, Object> event) {
        // Simuler la réception d'un événement stripe 'checkout.session.completed'
        String type = (String) event.get("type");
        if ("checkout.session.completed".equals(type)) {
            Map<String, Object> data = (Map<String, Object>) event.get("data");
            Map<String, Object> object = (Map<String, Object>) data.get("object");
            Map<String, Object> metadata = (Map<String, Object>) object.get("metadata");
            
            Long catererId = Long.valueOf((String) metadata.get("catererId"));
            String plan = (String) metadata.get("plan");

            com.example.eventmanager.domain.model.Caterer caterer = catererRepositoryPort.findById(catererId)
                    .orElseThrow(() -> new RuntimeException("Caterer not found"));

            caterer.updateSubscription(plan, "ACTIVE", java.time.LocalDateTime.now(), java.time.LocalDateTime.now().plusDays(30));
            caterer.activateAccount();

            catererRepositoryPort.save(caterer);
        }
        return ResponseEntity.ok().build();
    }
}
