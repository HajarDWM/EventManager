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
    private final com.example.eventmanager.application.port.in.RecordTransactionUseCase recordTransactionUseCase;
    private final com.example.eventmanager.application.port.out.BillingSettingRepositoryPort billingSettingRepositoryPort;

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
        
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime newEndDate;
        if (caterer.getSubscriptionPlan() != null && caterer.getSubscriptionPlan().equalsIgnoreCase(plan) 
                && caterer.getSubscriptionEndDate() != null && caterer.getSubscriptionEndDate().isAfter(now)) {
            newEndDate = caterer.getSubscriptionEndDate().plusDays(30);
        } else {
            newEndDate = now.plusDays(30);
        }
        caterer.updateSubscription(plan, "ACTIVE", now, newEndDate);
        caterer.activateAccount();
        catererRepositoryPort.save(caterer);

        // Fetch configured pricing settings dynamically
        com.example.eventmanager.domain.model.BillingSetting settings = billingSettingRepositoryPort.findById(1L)
                .orElseGet(() -> com.example.eventmanager.domain.model.BillingSetting.builder()
                        .vatRate(20.0)
                        .subscriptionPriceStandard(29.90)
                        .subscriptionPricePremium(59.90)
                        .build());

        java.math.BigDecimal amount = java.math.BigDecimal.ZERO;
        if ("STANDARD".equalsIgnoreCase(plan)) {
            amount = java.math.BigDecimal.valueOf(settings.getSubscriptionPriceStandard());
        } else if ("PREMIUM".equalsIgnoreCase(plan)) {
            amount = java.math.BigDecimal.valueOf(settings.getSubscriptionPricePremium());
        }
        java.math.BigDecimal vat = java.math.BigDecimal.valueOf(settings.getVatRate());

        // Record audit transaction
        recordTransactionUseCase.recordTransaction(catererId, plan, amount, vat, "SUCCESS");

        return ResponseEntity.ok(Map.of(
            "status", "SUCCESS",
            "message", "Abonnement activé avec succès en Mode Test."
        ));
    }
}
