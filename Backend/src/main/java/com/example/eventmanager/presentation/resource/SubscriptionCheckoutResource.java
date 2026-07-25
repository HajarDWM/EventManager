package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.port.out.SecurityContextPort;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionCheckoutResource {

    private final SecurityContextPort securityContextPort;

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> createCheckoutSession(@RequestParam String plan) {
        Long catererId = securityContextPort.getCurrentCatererId();
        // Simuler la création d'une session Stripe Checkout
        // Retourne un URL de redirection simulé
        String simulatedSessionUrl = "/pricing?payment_simulation=true&plan=" + plan + "&catererId=" + catererId;
        return ResponseEntity.ok(Map.of("url", simulatedSessionUrl));
    }
}
