package com.example.eventmanager.infrastructure.persistence.entity;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CatererEntityTest {

    @Test
    void testCatererEntityBuilderWithAllFields() {
        // Arrange
        Long id = 1L;
        String businessName = "Premium Catering";
        String email = "catering@example.com";
        String password = "securePassword123";
        String stripeCustomerId = "cus_123456789";
        String accountStatus = "ACTIVE";

        // Act
        CatererEntity entity = CatererEntity.builder()
                .id(id)
                .businessName(businessName)
                .email(email)
                .password(password)
                .stripeCustomerId(stripeCustomerId)
                .accountStatus(accountStatus)
                .build();

        // Assert
        assertEquals(id, entity.getId());
        assertEquals(businessName, entity.getBusinessName());
        assertEquals(email, entity.getEmail());
        assertEquals(password, entity.getPassword());
        assertEquals(stripeCustomerId, entity.getStripeCustomerId());
        assertEquals(accountStatus, entity.getAccountStatus());
    }

    @Test
    void testCatererEntityDefaultAccountStatus() {
        // Arrange & Act
        CatererEntity entity = new CatererEntity();

        // Assert
        assertEquals("PENDING", entity.getAccountStatus());
    }

    @Test
    void testCatererEntityBuilderWithoutOptionalFields() {
        // Arrange & Act
        CatererEntity entity = CatererEntity.builder()
                .id(1L)
                .businessName("Test Catering")
                .email("test@example.com")
                .password("password123")
                .build();

        // Assert
        assertEquals(1L, entity.getId());
        assertEquals("Test Catering", entity.getBusinessName());
        assertEquals("test@example.com", entity.getEmail());
        assertEquals("password123", entity.getPassword());
        assertNull(entity.getStripeCustomerId());
        assertEquals("PENDING", entity.getAccountStatus());
        assertEquals("TRAITEUR", entity.getRole());
        assertEquals("FREE", entity.getSubscriptionPlan());
        assertEquals("ACTIVE", entity.getSubscriptionStatus());
    }

    @Test
    void testCatererEntitySetters() {
        // Arrange
        CatererEntity entity = new CatererEntity();

        // Act
        entity.setId(2L);
        entity.setBusinessName("Updated Catering");
        entity.setEmail("updated@example.com");
        entity.setPassword("newPassword");
        entity.setStripeCustomerId("cus_987654321");
        entity.setAccountStatus("INACTIVE");

        // Assert
        assertEquals(2L, entity.getId());
        assertEquals("Updated Catering", entity.getBusinessName());
        assertEquals("updated@example.com", entity.getEmail());
        assertEquals("newPassword", entity.getPassword());
        assertEquals("cus_987654321", entity.getStripeCustomerId());
        assertEquals("INACTIVE", entity.getAccountStatus());
    }

    @Test
    void testCatererEntityNoArgsConstructor() {
        // Arrange & Act
        CatererEntity entity = new CatererEntity();

        // Assert
        assertNull(entity.getId());
        assertNull(entity.getBusinessName());
        assertNull(entity.getEmail());
        assertNull(entity.getPassword());
        assertNull(entity.getStripeCustomerId());
        assertEquals("PENDING", entity.getAccountStatus()); // Default value
    }

    @Test
    void testCatererEntityAllArgsConstructor() {
        // Arrange
        Long id = 3L;
        String businessName = "All Args Catering";
        String email = "allargs@example.com";
        String password = "allArgsPassword";
        String stripeCustomerId = "cus_111111111";
        String accountStatus = "SUSPENDED";
        String role = "TRAITEUR";
        String subscriptionPlan = "FREE";
        String subscriptionStatus = "ACTIVE";
        java.time.LocalDateTime startDate = java.time.LocalDateTime.now();
        java.time.LocalDateTime endDate = java.time.LocalDateTime.now().plusDays(30);

        // Act
        CatererEntity entity = new CatererEntity(id, businessName, email, password, stripeCustomerId, accountStatus, role, subscriptionPlan, subscriptionStatus, startDate, endDate);

        // Assert
        assertEquals(id, entity.getId());
        assertEquals(businessName, entity.getBusinessName());
        assertEquals(email, entity.getEmail());
        assertEquals(password, entity.getPassword());
        assertEquals(stripeCustomerId, entity.getStripeCustomerId());
        assertEquals(accountStatus, entity.getAccountStatus());
        assertEquals(role, entity.getRole());
        assertEquals(subscriptionPlan, entity.getSubscriptionPlan());
        assertEquals(subscriptionStatus, entity.getSubscriptionStatus());
        assertEquals(startDate, entity.getSubscriptionStartDate());
        assertEquals(endDate, entity.getSubscriptionEndDate());
    }

    @Test
    void testCatererEntityEquality() {
        // Arrange
        CatererEntity entity1 = CatererEntity.builder()
                .id(1L)
                .businessName("Test Catering")
                .email("test@example.com")
                .password("password123")
                .stripeCustomerId("cus_123")
                .accountStatus("ACTIVE")
                .build();

        CatererEntity entity2 = CatererEntity.builder()
                .id(1L)
                .businessName("Test Catering")
                .email("test@example.com")
                .password("password123")
                .stripeCustomerId("cus_123")
                .accountStatus("ACTIVE")
                .build();

        // Assert
        assertEquals(entity1, entity2);
    }
}

