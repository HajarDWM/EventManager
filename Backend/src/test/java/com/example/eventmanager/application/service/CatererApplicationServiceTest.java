package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.application.mapper.CatererMapper;
import com.example.eventmanager.application.port.out.BillingSettingRepositoryPort;
import com.example.eventmanager.application.port.out.CatererRepositoryPort;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.PasswordEncoderPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.model.BillingSetting;
import com.example.eventmanager.domain.model.Caterer;
import com.example.eventmanager.domain.model.CatererRole;
import com.example.eventmanager.domain.model.CatererStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CatererApplicationServiceTest {

    @Mock
    private CatererRepositoryPort catererRepositoryPort;
    @Mock
    private CatererMapper catererMapper;
    @Mock
    private PasswordEncoderPort passwordEncoderPort;
    @Mock
    private SecurityContextPort securityContextPort;
    @Mock
    private EventRepositoryPort eventRepositoryPort;
    @Mock
    private BillingSettingRepositoryPort billingSettingRepositoryPort;

    @InjectMocks
    private CatererApplicationService catererApplicationService;

    private CatererDTO testCatererDTO;
    private BillingSetting testBillingSetting;

    @BeforeEach
    void setUp() {
        testBillingSetting = BillingSetting.builder()
                .id(1L)
                .gracePeriodDays(10)
                .build();

        testCatererDTO = CatererDTO.builder()
                .id(100L)
                .businessName("Test Traiteur")
                .email("traiteur@example.com")
                .role("TRAITEUR")
                .accountStatus("APPROVED")
                .subscriptionPlan("STANDARD")
                .subscriptionStatus("ACTIVE")
                .build();
    }

    @Test
    @DisplayName("Active subscription before billing date -> Not expired, Not in grace period")
    void testSubscriptionBeforeEndDate() {
        LocalDateTime start = LocalDateTime.now().minusDays(15);
        LocalDateTime futureEnd = LocalDateTime.now().plusDays(15);
        Caterer caterer = Caterer.builder()
                .id(100L)
                .businessName("Test Traiteur")
                .email("traiteur@example.com")
                .role(CatererRole.TRAITEUR)
                .accountStatus(CatererStatus.APPROVED)
                .subscriptionPlan("STANDARD")
                .subscriptionStatus("ACTIVE")
                .subscriptionStartDate(start)
                .subscriptionEndDate(futureEnd)
                .build();

        when(securityContextPort.getCurrentCatererId()).thenReturn(100L);
        when(catererRepositoryPort.findById(100L)).thenReturn(Optional.of(caterer));
        when(catererMapper.toDTO(caterer)).thenReturn(testCatererDTO);
        when(billingSettingRepositoryPort.findById(1L)).thenReturn(Optional.of(testBillingSetting));

        CatererDTO result = catererApplicationService.getCurrentCatererProfile();

        assertNotNull(result);
        assertFalse(result.getIsExpired());
        assertFalse(Boolean.TRUE.equals(result.getInGracePeriod()));
    }

    @Test
    @DisplayName("Billing date passed by 3 days (within 10-day grace period) -> In grace period, Account ACTIVE")
    void testSubscriptionInGracePeriod() {
        LocalDateTime start = LocalDateTime.now().minusDays(33);
        LocalDateTime pastEnd = LocalDateTime.now().minusDays(3);
        Caterer caterer = Caterer.builder()
                .id(100L)
                .businessName("Test Traiteur")
                .email("traiteur@example.com")
                .role(CatererRole.TRAITEUR)
                .accountStatus(CatererStatus.APPROVED)
                .subscriptionPlan("STANDARD")
                .subscriptionStatus("ACTIVE")
                .subscriptionStartDate(start)
                .subscriptionEndDate(pastEnd)
                .build();

        when(securityContextPort.getCurrentCatererId()).thenReturn(100L);
        when(catererRepositoryPort.findById(100L)).thenReturn(Optional.of(caterer));
        when(catererMapper.toDTO(caterer)).thenReturn(testCatererDTO);
        when(billingSettingRepositoryPort.findById(1L)).thenReturn(Optional.of(testBillingSetting));

        CatererDTO result = catererApplicationService.getCurrentCatererProfile();

        assertNotNull(result);
        assertFalse(result.getIsExpired(), "Account must NOT be expired during grace period");
        assertTrue(Boolean.TRUE.equals(result.getInGracePeriod()), "Account must be marked as in grace period");
        assertEquals("GRACE_PERIOD", result.getSubscriptionStatus());
        assertTrue(result.getGracePeriodDaysRemaining() > 0, "Grace period remaining days must be > 0");
    }

    @Test
    @DisplayName("Billing date passed by 12 days (past 10-day grace period) -> Account EXPIRED")
    void testSubscriptionAfterGracePeriod() {
        LocalDateTime start = LocalDateTime.now().minusDays(42);
        LocalDateTime pastEnd = LocalDateTime.now().minusDays(12);
        Caterer caterer = Caterer.builder()
                .id(100L)
                .businessName("Test Traiteur")
                .email("traiteur@example.com")
                .role(CatererRole.TRAITEUR)
                .accountStatus(CatererStatus.APPROVED)
                .subscriptionPlan("STANDARD")
                .subscriptionStatus("ACTIVE")
                .subscriptionStartDate(start)
                .subscriptionEndDate(pastEnd)
                .build();

        when(securityContextPort.getCurrentCatererId()).thenReturn(100L);
        when(catererRepositoryPort.findById(100L)).thenReturn(Optional.of(caterer));
        when(catererMapper.toDTO(caterer)).thenReturn(testCatererDTO);
        when(billingSettingRepositoryPort.findById(1L)).thenReturn(Optional.of(testBillingSetting));

        CatererDTO result = catererApplicationService.getCurrentCatererProfile();

        assertNotNull(result);
        assertTrue(result.getIsExpired(), "Account MUST be expired after grace period ends");
        assertFalse(Boolean.TRUE.equals(result.getInGracePeriod()));
        assertEquals("EXPIRED", result.getSubscriptionStatus());
    }
}
