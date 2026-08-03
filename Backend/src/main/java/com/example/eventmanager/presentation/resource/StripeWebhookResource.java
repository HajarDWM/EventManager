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
    private final com.example.eventmanager.application.port.in.RecordTransactionUseCase recordTransactionUseCase;
    private final com.example.eventmanager.application.port.out.BillingSettingRepositoryPort billingSettingRepositoryPort;

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
        }
        return ResponseEntity.ok().build();
    }
}
