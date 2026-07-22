package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.AdminStatsDTO;
import com.example.eventmanager.application.dto.BillingSettingDTO;
import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.application.dto.InvitationTemplateDTO;
import com.example.eventmanager.application.mapper.BillingSettingMapper;
import com.example.eventmanager.application.mapper.CatererMapper;
import com.example.eventmanager.application.mapper.InvitationTemplateMapper;
import com.example.eventmanager.application.port.in.AdminBillingSettingUseCase;
import com.example.eventmanager.application.port.in.AdminCatererUseCase;
import com.example.eventmanager.application.port.in.AdminInvitationTemplateUseCase;
import com.example.eventmanager.application.port.in.AdminStatsUseCase;
import com.example.eventmanager.application.port.out.BillingSettingRepositoryPort;
import com.example.eventmanager.application.port.out.CatererRepositoryPort;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.GuestRepositoryPort;
import com.example.eventmanager.application.port.out.InvitationTemplateRepositoryPort;
import com.example.eventmanager.domain.model.BillingSetting;
import com.example.eventmanager.domain.model.Caterer;
import com.example.eventmanager.domain.model.CatererStatus;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.InvitationTemplate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminApplicationService implements AdminCatererUseCase, AdminStatsUseCase, AdminInvitationTemplateUseCase, AdminBillingSettingUseCase {

    private final CatererRepositoryPort catererRepositoryPort;
    private final EventRepositoryPort eventRepositoryPort;
    private final GuestRepositoryPort guestRepositoryPort;
    private final InvitationTemplateRepositoryPort invitationTemplateRepositoryPort;
    private final BillingSettingRepositoryPort billingSettingRepositoryPort;

    private final CatererMapper catererMapper;
    private final InvitationTemplateMapper invitationTemplateMapper;
    private final BillingSettingMapper billingSettingMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CatererDTO> getAllCaterers() {
        return catererRepositoryPort.findAll().stream()
                .map(catererMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional
    public CatererDTO updateCatererStatusAndSubscription(Long id, String accountStatus, String plan, String subscriptionStatus) {
        Caterer caterer = catererRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Traiteur introuvable avec l'id: " + id));

        if (accountStatus != null) {
            if ("SUSPENDED".equalsIgnoreCase(accountStatus)) {
                caterer.suspendAccount();
            } else if ("ACTIVE".equalsIgnoreCase(accountStatus)) {
                caterer.activateAccount();
            }
        }

        caterer.updateSubscription(
                plan != null ? plan : caterer.getSubscriptionPlan(),
                subscriptionStatus != null ? subscriptionStatus : caterer.getSubscriptionStatus()
        );

        Caterer saved = catererRepositoryPort.save(caterer);
        return catererMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminStatsDTO getGlobalStats() {
        List<Caterer> caterers = catererRepositoryPort.findAll();
        List<Event> events = eventRepositoryPort.findAll();

        Map<String, Long> catererStatusDistribution = caterers.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getAccountStatus() != null ? c.getAccountStatus().name() : "ACTIVE",
                        Collectors.counting()
                ));

        Map<String, Long> subscriptionPlanDistribution = caterers.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getSubscriptionPlan() != null ? c.getSubscriptionPlan() : "FREE",
                        Collectors.counting()
                ));

        Map<String, Long> eventsStatusDistribution = events.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getStatus() != null ? e.getStatus().name() : "DRAFT",
                        Collectors.counting()
                ));

        return AdminStatsDTO.builder()
                .totalCaterers(caterers.size())
                .totalEvents(events.size())
                .totalGuests(guestRepositoryPort.count())
                .catererStatusDistribution(catererStatusDistribution)
                .subscriptionPlanDistribution(subscriptionPlanDistribution)
                .eventsStatusDistribution(eventsStatusDistribution)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvitationTemplateDTO> getAllTemplates() {
        return invitationTemplateRepositoryPort.findAll().stream()
                .map(invitationTemplateMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public InvitationTemplateDTO getTemplateById(Long id) {
        InvitationTemplate template = invitationTemplateRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Modèle introuvable avec l'id: " + id));
        return invitationTemplateMapper.toDTO(template);
    }

    @Override
    @Transactional
    public InvitationTemplateDTO createTemplate(InvitationTemplateDTO dto) {
        InvitationTemplate template = invitationTemplateMapper.toDomain(dto);
        InvitationTemplate saved = invitationTemplateRepositoryPort.save(template);
        return invitationTemplateMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public InvitationTemplateDTO updateTemplate(Long id, InvitationTemplateDTO dto) {
        InvitationTemplate template = invitationTemplateRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Modèle introuvable avec l'id: " + id));

        template.updateTemplate(dto.getName(), dto.getSubject(), dto.getContent());
        InvitationTemplate saved = invitationTemplateRepositoryPort.save(template);
        return invitationTemplateMapper.toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteTemplate(Long id) {
        invitationTemplateRepositoryPort.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public BillingSettingDTO getBillingSetting() {
        // La configuration par défaut a l'ID 1
        BillingSetting billing = billingSettingRepositoryPort.findById(1L)
                .orElseGet(() -> {
                    // Création de repli si inexistant
                    BillingSetting newBilling = BillingSetting.builder()
                            .id(1L)
                            .vatRate(20.0)
                            .currency("EUR")
                            .subscriptionPriceStandard(29.90)
                            .subscriptionPricePremium(59.90)
                            .billingContactEmail("billing@eventmanager.com")
                            .build();
                    return billingSettingRepositoryPort.save(newBilling);
                });
        return billingSettingMapper.toDTO(billing);
    }

    @Override
    @Transactional
    public BillingSettingDTO updateBillingSetting(BillingSettingDTO dto) {
        BillingSetting billing = billingSettingRepositoryPort.findById(1L)
                .orElseThrow(() -> new RuntimeException("Configuration de facturation système introuvable"));

        billing.updateBilling(
                dto.getVatRate() != null ? dto.getVatRate() : billing.getVatRate(),
                dto.getCurrency() != null ? dto.getCurrency() : billing.getCurrency(),
                dto.getSubscriptionPriceStandard() != null ? dto.getSubscriptionPriceStandard() : billing.getSubscriptionPriceStandard(),
                dto.getSubscriptionPricePremium() != null ? dto.getSubscriptionPricePremium() : billing.getSubscriptionPricePremium(),
                dto.getBillingContactEmail() != null ? dto.getBillingContactEmail() : billing.getBillingContactEmail()
        );

        BillingSetting saved = billingSettingRepositoryPort.save(billing);
        return billingSettingMapper.toDTO(saved);
    }
}
