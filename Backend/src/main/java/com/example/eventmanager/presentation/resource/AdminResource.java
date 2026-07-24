package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.AdminStatsDTO;
import com.example.eventmanager.application.dto.BillingSettingDTO;
import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.application.dto.InvitationTemplateDTO;
import com.example.eventmanager.application.port.in.AdminBillingSettingUseCase;
import com.example.eventmanager.application.port.in.AdminCatererUseCase;
import com.example.eventmanager.application.port.in.AdminInvitationTemplateUseCase;
import com.example.eventmanager.application.port.in.AdminStatsUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminResource {

    private final AdminCatererUseCase adminCatererUseCase;
    private final AdminStatsUseCase adminStatsUseCase;
    private final AdminInvitationTemplateUseCase adminInvitationTemplateUseCase;
    private final AdminBillingSettingUseCase adminBillingSettingUseCase;

    // === GESTION DES STATISTIQUES GLOBALES ===
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getGlobalStats() {
        return ResponseEntity.ok(adminStatsUseCase.getGlobalStats());
    }

    // === GESTION DES COMPTES TRAITEURS ===
    @GetMapping("/caterers")
    public ResponseEntity<List<CatererDTO>> getAllCaterers(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminCatererUseCase.getAllCaterers(status));
    }

    @PutMapping("/caterers/{id}")
    public ResponseEntity<CatererDTO> updateCatererStatusAndSubscription(
            @PathVariable Long id,
            @RequestParam(required = false) String accountStatus,
            @RequestParam(required = false) String plan,
            @RequestParam(required = false) String subscriptionStatus,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime subscriptionStartDate,
            @RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE_TIME) java.time.LocalDateTime subscriptionEndDate) {
        CatererDTO updated = adminCatererUseCase.updateCatererStatusAndSubscription(id, accountStatus, plan, subscriptionStatus, subscriptionStartDate, subscriptionEndDate);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/caterers")
    public ResponseEntity<CatererDTO> createCaterer(@RequestBody CatererDTO dto) {
        CatererDTO created = adminCatererUseCase.createCaterer(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // === GESTION DES MODÈLES D'INVITATIONS ===
    @GetMapping("/invitation-templates")
    public ResponseEntity<List<InvitationTemplateDTO>> getAllTemplates() {
        return ResponseEntity.ok(adminInvitationTemplateUseCase.getAllTemplates());
    }

    @GetMapping("/invitation-templates/{id}")
    public ResponseEntity<InvitationTemplateDTO> getTemplateById(@PathVariable Long id) {
        return ResponseEntity.ok(invitationTemplateUseCaseGetTemplate(id));
    }

    private InvitationTemplateDTO invitationTemplateUseCaseGetTemplate(Long id) {
        return adminInvitationTemplateUseCase.getTemplateById(id);
    }

    @PostMapping("/invitation-templates")
    public ResponseEntity<InvitationTemplateDTO> createTemplate(@RequestBody InvitationTemplateDTO dto) {
        InvitationTemplateDTO created = adminInvitationTemplateUseCase.createTemplate(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/invitation-templates/{id}")
    public ResponseEntity<InvitationTemplateDTO> updateTemplate(
            @PathVariable Long id,
            @RequestBody InvitationTemplateDTO dto) {
        InvitationTemplateDTO updated = adminInvitationTemplateUseCase.updateTemplate(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/invitation-templates/{id}")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        adminInvitationTemplateUseCase.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    // === PARAMÈTRES DE FACTURATION GLOBALE ===
    @GetMapping("/billing-settings")
    public ResponseEntity<BillingSettingDTO> getBillingSetting() {
        return ResponseEntity.ok(adminBillingSettingUseCase.getBillingSetting());
    }

    @PutMapping("/billing-settings")
    public ResponseEntity<BillingSettingDTO> updateBillingSetting(@RequestBody BillingSettingDTO dto) {
        BillingSettingDTO updated = adminBillingSettingUseCase.updateBillingSetting(dto);
        return ResponseEntity.ok(updated);
    }
}
