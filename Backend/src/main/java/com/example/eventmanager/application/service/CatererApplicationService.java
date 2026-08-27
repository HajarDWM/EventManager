package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.application.dto.ChangePasswordDTO;
import com.example.eventmanager.application.mapper.CatererMapper;
import com.example.eventmanager.application.port.in.CreateCatererUseCase;
import com.example.eventmanager.application.port.in.GetCatererUseCase;
import com.example.eventmanager.application.port.in.UpdateCatererProfileUseCase;
import com.example.eventmanager.application.port.out.CatererRepositoryPort;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.PasswordEncoderPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.exception.CatererAlreadyExistsException;
import com.example.eventmanager.domain.exception.CatererNotFoundException;
import com.example.eventmanager.domain.model.Caterer;
import com.example.eventmanager.domain.model.Event;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CatererApplicationService implements CreateCatererUseCase, GetCatererUseCase, UpdateCatererProfileUseCase {

    private final CatererRepositoryPort catererRepositoryPort;
    private final CatererMapper catererMapper;
    private final PasswordEncoderPort passwordEncoderPort;
    private final SecurityContextPort securityContextPort;
    private final EventRepositoryPort eventRepositoryPort;
    private final com.example.eventmanager.application.port.out.BillingSettingRepositoryPort billingSettingRepositoryPort;

    @Override
    @Transactional
    public CatererDTO createCaterer(CatererDTO catererDTO) {
        if (catererRepositoryPort.existsByEmail(catererDTO.getEmail())) {
            throw new CatererAlreadyExistsException(catererDTO.getEmail());
        }

        // Hacher le mot de passe avant de créer l'objet domaine
        String encodedPassword = passwordEncoderPort.encode(catererDTO.getPassword());
        catererDTO.setPassword(encodedPassword);
        catererDTO.setRole("TRAITEUR");
        catererDTO.setSubscriptionPlan("FREE");
        catererDTO.setSubscriptionStatus("ACTIVE");
        catererDTO.setSubscriptionStartDate(java.time.LocalDateTime.now());
        catererDTO.setSubscriptionEndDate(java.time.LocalDateTime.now().plusDays(30));

        Caterer catererToSave = catererMapper.toDomain(catererDTO);
        
        // Par défaut, un nouveau compte est en attente (PENDING)
        catererToSave.pendAccount();

        Caterer savedCaterer = catererRepositoryPort.save(catererToSave);

        return catererMapper.toDTO(savedCaterer);
    }

    @Override
    @Transactional(readOnly = true)
    public CatererDTO getCurrentCatererProfile() {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Caterer caterer = catererRepositoryPort.findById(currentCatererId)
                .orElseThrow(() -> new CatererNotFoundException(currentCatererId));
        CatererDTO dto = catererMapper.toDTO(caterer);

        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        boolean isExpired = false;
        boolean inGracePeriod = false;
        long gracePeriodDaysRemaining = 0;

        int gracePeriodDays = billingSettingRepositoryPort.findById(1L)
                .map(b -> b.getGracePeriodDays() != null ? b.getGracePeriodDays() : 10)
                .orElse(10);

        if (caterer.getRole() != com.example.eventmanager.domain.model.CatererRole.SUPER_ADMIN && !"FREE".equalsIgnoreCase(caterer.getSubscriptionPlan())) {
            if (caterer.getSubscriptionEndDate() != null) {
                java.time.LocalDateTime endDate = caterer.getSubscriptionEndDate();
                java.time.LocalDateTime graceEndDate = endDate.plusDays(gracePeriodDays);

                if (now.isAfter(endDate) && now.isBefore(graceEndDate)) {
                    // La date de facturation est dépassée, mais dans la période de grâce (max 10 jours)
                    inGracePeriod = true;
                    isExpired = false; // Le compte reste actif normalement avec des rappels amicals
                    gracePeriodDaysRemaining = Math.max(1, java.time.temporal.ChronoUnit.DAYS.between(now, graceEndDate));
                    dto.setSubscriptionStatus("GRACE_PERIOD");
                } else if (now.isAfter(graceEndDate)) {
                    // Période de grâce terminée -> Le compte est réellement expiré/suspendu
                    isExpired = true;
                    dto.setSubscriptionStatus("EXPIRED");
                } else if ("EXPIRED".equalsIgnoreCase(caterer.getSubscriptionStatus())) {
                    isExpired = true;
                }
            } else if ("EXPIRED".equalsIgnoreCase(caterer.getSubscriptionStatus())) {
                isExpired = true;
            }
        }
        dto.setExpired(isExpired);
        dto.setInGracePeriod(inGracePeriod);
        dto.setGracePeriodDaysRemaining(gracePeriodDaysRemaining);

        if (caterer.getSubscriptionEndDate() != null) {
            long remaining = java.time.temporal.ChronoUnit.DAYS.between(now, caterer.getSubscriptionEndDate());
            dto.setSubscriptionRemainingDays(Math.max(0, remaining));
        } else {
            dto.setSubscriptionRemainingDays(0L);
        }

        if (caterer.getRole() != com.example.eventmanager.domain.model.CatererRole.SUPER_ADMIN) {
            String plan = caterer.getSubscriptionPlan();
            java.time.LocalDateTime startDate = caterer.getSubscriptionStartDate();
            long eventCount;
            if (plan == null || "FREE".equalsIgnoreCase(plan) || plan.isBlank()) {
                eventCount = eventRepositoryPort.countByCatererId(currentCatererId);
            } else {
                if (startDate != null) {
                    eventCount = eventRepositoryPort.countByCatererIdAndCreatedAtAfter(currentCatererId, startDate);
                } else {
                    eventCount = eventRepositoryPort.countByCatererId(currentCatererId);
                }
            }
            dto.setEventCount((int) eventCount);
            
            int limit = switch (plan != null ? plan.toUpperCase() : "FREE") {
                case "STANDARD", "STANDARD_PRO", "STANDARD PRO" -> 8;
                case "PREMIUM" -> 20;
                default -> 2; // "FREE"
            };
            dto.setEventLimit(limit);
        } else {
            dto.setEventCount(0);
            dto.setEventLimit(Integer.MAX_VALUE);
        }
        return dto;
    }

    @Override
    @Transactional
    public CatererDTO updateCatererProfile(CatererDTO catererDTO) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Caterer caterer = catererRepositoryPort.findById(currentCatererId)
                .orElseThrow(() -> new CatererNotFoundException(currentCatererId));

        if (catererDTO.getBusinessName() != null && !catererDTO.getBusinessName().isBlank()) {
            caterer.updateBusinessName(catererDTO.getBusinessName());
        }

        Caterer updated = catererRepositoryPort.save(caterer);
        return catererMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordDTO changePasswordDTO) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Caterer caterer = catererRepositoryPort.findById(currentCatererId)
                .orElseThrow(() -> new CatererNotFoundException(currentCatererId));

        if (!passwordEncoderPort.matches(changePasswordDTO.getCurrentPassword(), caterer.getPassword())) {
            throw new IllegalArgumentException("L'ancien mot de passe est incorrect.");
        }

        String newEncodedPassword = passwordEncoderPort.encode(changePasswordDTO.getNewPassword());
        caterer.updatePassword(newEncodedPassword);
        catererRepositoryPort.save(caterer);
    }

    @Override
    @Transactional(readOnly = true)
    public CatererDTO getCatererById(Long id) {
        Caterer caterer = catererRepositoryPort.findById(id)
                .orElseThrow(() -> new CatererNotFoundException(id));
        return catererMapper.toDTO(caterer);
    }

    @Override
    @Transactional(readOnly = true)
    public CatererDTO getCatererByEmail(String email) {
        Caterer caterer = catererRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new CatererNotFoundException(email));
        return catererMapper.toDTO(caterer);
    }

    @Override
    @Transactional
    public CatererDTO upgradeSubscription(String plan) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Caterer caterer = catererRepositoryPort.findById(currentCatererId)
                .orElseThrow(() -> new CatererNotFoundException(currentCatererId));

        caterer.updateSubscription(
                plan,
                "ACTIVE",
                java.time.LocalDateTime.now(),
                java.time.LocalDateTime.now().plusDays(30)
        );
        caterer.activateAccount(); // Automatically approve account upon subscription!

        Caterer saved = catererRepositoryPort.save(caterer);
        return catererMapper.toDTO(saved);
    }
}
