package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.port.out.CatererRepositoryPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.model.Caterer;
import com.example.eventmanager.domain.exception.CatererNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionCheckoutResource {

    private final SecurityContextPort securityContextPort;
    private final CatererRepositoryPort catererRepositoryPort;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestParam String plan) {
        Long catererId = securityContextPort.getCurrentCatererId();
        // Simuler la création d'une session Stripe Checkout
        // Retourne un URL de redirection simulé
        String simulatedSessionUrl = "/pricing?payment_simulation=true&plan=" + plan + "&catererId=" + catererId;
        return ResponseEntity.ok(Map.of("url", simulatedSessionUrl));
    }

    @PostMapping("/simulate-payment")
    public ResponseEntity<Map<String, String>> simulatePayment(@RequestParam String plan) {
        Long catererId = securityContextPort.getCurrentCatererId();
        
        Caterer caterer = catererRepositoryPort.findById(catererId)
                .orElseThrow(() -> new CatererNotFoundException(catererId));
        
        caterer.updateSubscription(plan, "ACTIVE", java.time.LocalDateTime.now(), java.time.LocalDateTime.now().plusDays(30));
        caterer.activateAccount();
        catererRepositoryPort.save(caterer);

        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "message", "Abonnement activé avec succès en Mode Test."
        ));
    }
}
