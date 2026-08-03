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
import com.example.eventmanager.application.port.out.PasswordEncoderPort;
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
    private final PasswordEncoderPort passwordEncoderPort;

    private final CatererMapper catererMapper;
    private final InvitationTemplateMapper invitationTemplateMapper;
    private final BillingSettingMapper billingSettingMapper;

    private int getEventLimitForPlan(String plan) {
        if (plan == null) return 2;
        return switch (plan.toUpperCase()) {
            case "STANDARD", "STANDARD_PRO", "STANDARD PRO" -> 8;
            case "PREMIUM" -> 20;
            default -> 2; // "FREE"
        };
    }

    private Long getRemainingDays(java.time.LocalDateTime endDate) {
        if (endDate == null) return 0L;
        return java.time.temporal.ChronoUnit.DAYS.between(java.time.LocalDateTime.now(), endDate);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CatererDTO> getAllCaterers(String status) {
        List<Caterer> caterers = catererRepositoryPort.findAll();

        return caterers.stream()
                .filter(c -> c.getRole() != com.example.eventmanager.domain.model.CatererRole.SUPER_ADMIN)
                .filter(c -> status == null || status.isBlank() || status.equalsIgnoreCase(c.getAccountStatus() != null ? c.getAccountStatus().name() : ""))
                .map(c -> {
                    CatererDTO dto = catererMapper.toDTO(c);
                    
                    // Calcul cumulatif du nombre d'événements créés (Anti-Cheat) pour le Super-Admin
                    String plan = c.getSubscriptionPlan();
                    java.time.LocalDateTime startDate = c.getSubscriptionStartDate();
                    long count;
                    if (plan == null || "FREE".equalsIgnoreCase(plan) || plan.isBlank()) {
                        count = eventRepositoryPort.countByCatererId(c.getId());
                    } else {
                        if (startDate != null) {
                            count = eventRepositoryPort.countByCatererIdAndCreatedAtAfter(c.getId(), startDate);
                        } else {
                            count = eventRepositoryPort.countByCatererId(c.getId());
                        }
                    }
                    
                    dto.setEventCount((int) count);
                    dto.setEventLimit(getEventLimitForPlan(c.getSubscriptionPlan()));
                    dto.setSubscriptionRemainingDays(getRemainingDays(c.getSubscriptionEndDate()));
                    return dto;
                })
                .toList();
    }

    @Override
    @Transactional
    public CatererDTO updateCatererStatusAndSubscription(Long id, String accountStatus, String plan, String subscriptionStatus, java.time.LocalDateTime startDate, java.time.LocalDateTime endDate) {
        Caterer caterer = catererRepositoryPort.findById(id)
                .orElseThrow(() -> new RuntimeException("Traiteur introuvable avec l'id: " + id));

        if (accountStatus != null) {
            if ("SUSPENDED".equalsIgnoreCase(accountStatus)) {
                caterer.suspendAccount();
            } else if ("ACTIVE".equalsIgnoreCase(accountStatus) || "APPROVED".equalsIgnoreCase(accountStatus)) {
                caterer.activateAccount();
            } else if ("PENDING".equalsIgnoreCase(accountStatus)) {
                caterer.pendAccount();
            }
        }

        caterer.updateSubscription(
                plan != null ? plan : caterer.getSubscriptionPlan(),
                subscriptionStatus != null ? subscriptionStatus : caterer.getSubscriptionStatus(),
                startDate != null ? startDate : caterer.getSubscriptionStartDate(),
                endDate != null ? endDate : caterer.getSubscriptionEndDate()
        );

        Caterer saved = catererRepositoryPort.save(caterer);
        
        CatererDTO dto = catererMapper.toDTO(saved);
        
        // Calcul cumulatif du nombre d'événements créés (Anti-Cheat)
        String catererPlan = saved.getSubscriptionPlan();
        java.time.LocalDateTime catererStartDate = saved.getSubscriptionStartDate();
        long count;
        if (catererPlan == null || "FREE".equalsIgnoreCase(catererPlan) || catererPlan.isBlank()) {
            count = eventRepositoryPort.countByCatererId(saved.getId());
        } else {
            if (catererStartDate != null) {
                count = eventRepositoryPort.countByCatererIdAndCreatedAtAfter(saved.getId(), catererStartDate);
            } else {
                count = eventRepositoryPort.countByCatererId(saved.getId());
            }
        }
        
        dto.setEventCount((int) count);
        dto.setEventLimit(getEventLimitForPlan(saved.getSubscriptionPlan()));
        dto.setSubscriptionRemainingDays(getRemainingDays(saved.getSubscriptionEndDate()));
        return dto;
    }

    @Override
    @Transactional
    public CatererDTO createCaterer(CatererDTO dto) {
        if (dto.getSubscriptionStartDate() == null) {
            dto.setSubscriptionStartDate(java.time.LocalDateTime.now());
        }
        if (dto.getSubscriptionEndDate() == null) {
            dto.setSubscriptionEndDate(java.time.LocalDateTime.now().plusDays(30));
        }

        catererRepositoryPort.findByEmail(dto.getEmail()).ifPresent(c -> {
            throw new RuntimeException("Un compte traiteur existe déjà avec cette adresse email.");
        });

        Caterer caterer = catererMapper.toDomain(dto);
        caterer.updatePassword(passwordEncoderPort.encode(dto.getPassword()));
        caterer.activateAccount();

        Caterer saved = catererRepositoryPort.save(caterer);

        CatererDTO savedDto = catererMapper.toDTO(saved);
        savedDto.setEventCount(0);
        savedDto.setEventLimit(getEventLimitForPlan(saved.getSubscriptionPlan()));
        savedDto.setSubscriptionRemainingDays(getRemainingDays(saved.getSubscriptionEndDate()));
        return savedDto;
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
