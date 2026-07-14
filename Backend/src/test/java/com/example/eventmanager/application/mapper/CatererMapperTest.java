package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.infrastructure.persistence.entity.CatererEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CatererMapperTest {

    private CatererMapper mapper;

    @BeforeEach
    void setUp() {
        mapper = new CatererMapper();
    }

    @Test
    void testToDTOWithValidEntity() {
        // Arrange
        CatererEntity entity = CatererEntity.builder()
                .id(1L)
                .businessName("Premium Catering")
                .email("catering@example.com")
                .password("securePassword123")
                .stripeCustomerId("cus_123456789")
                .accountStatus("ACTIVE")
                .build();

        // Act
        CatererDTO dto = mapper.toDTO(entity);

        // Assert
        assertNotNull(dto);
        assertEquals(1L, dto.getId());
        assertEquals("Premium Catering", dto.getBusinessName());
        assertEquals("catering@example.com", dto.getEmail());
        assertEquals("securePassword123", dto.getPassword());
        assertEquals("cus_123456789", dto.getStripeCustomerId());
        assertEquals("ACTIVE", dto.getAccountStatus());
    }

    @Test
    void testToDTOWithNullEntity() {
        // Act
        CatererDTO dto = mapper.toDTO(null);

        // Assert
        assertNull(dto);
    }

    @Test
    void testToEntityWithValidDTO() {
        // Arrange
        CatererDTO dto = CatererDTO.builder()
                .id(2L)
                .businessName("Deluxe Catering")
                .email("deluxe@example.com")
                .password("deluxePassword")
                .stripeCustomerId("cus_987654321")
                .accountStatus("ACTIVE")
                .build();

        // Act
        CatererEntity entity = mapper.toEntity(dto);

        // Assert
        assertNotNull(entity);
        assertEquals(2L, entity.getId());
        assertEquals("Deluxe Catering", entity.getBusinessName());
        assertEquals("deluxe@example.com", entity.getEmail());
        assertEquals("deluxePassword", entity.getPassword());
        assertEquals("cus_987654321", entity.getStripeCustomerId());
        assertEquals("ACTIVE", entity.getAccountStatus());
    }

    @Test
    void testToEntityWithNullDTO() {
        // Act
        CatererEntity entity = mapper.toEntity(null);

        // Assert
        assertNull(entity);
    }

    @Test
    void testToEntityWithNullAccountStatusDefaultsToActive() {
        // Arrange
        CatererDTO dto = CatererDTO.builder()
                .id(3L)
                .businessName("Basic Catering")
                .email("basic@example.com")
                .password("basicPassword")
                .stripeCustomerId(null)
                .accountStatus(null)
                .build();

        // Act
        CatererEntity entity = mapper.toEntity(dto);

        // Assert
        assertNotNull(entity);
        assertEquals("ACTIVE", entity.getAccountStatus());
    }

    @Test
    void testUpdateEntityFromDTOWithValidInputs() {
        // Arrange
        CatererEntity entity = CatererEntity.builder()
                .id(4L)
                .businessName("Original Catering")
                .email("original@example.com")
                .password("originalPassword")
                .stripeCustomerId("cus_old")
                .accountStatus("ACTIVE")
                .build();

        CatererDTO dto = CatererDTO.builder()
                .id(4L)
                .businessName("Updated Catering")
                .email("updated@example.com")
                .password("updatedPassword")
                .stripeCustomerId("cus_new")
                .accountStatus("SUSPENDED")
                .build();

        // Act
        mapper.updateEntityFromDTO(dto, entity);

        // Assert
        assertEquals(4L, entity.getId()); // ID should not change
        assertEquals("Updated Catering", entity.getBusinessName());
        assertEquals("updated@example.com", entity.getEmail());
        assertEquals("updatedPassword", entity.getPassword());
        assertEquals("cus_new", entity.getStripeCustomerId());
        assertEquals("SUSPENDED", entity.getAccountStatus());
    }

    @Test
    void testUpdateEntityFromDTOWithNullEntity() {
        // Arrange
        CatererDTO dto = CatererDTO.builder()
                .businessName("Test")
                .build();

        // Act & Assert - should not throw exception
        assertDoesNotThrow(() -> mapper.updateEntityFromDTO(dto, null));
    }

    @Test
    void testUpdateEntityFromDTOWithNullDTO() {
        // Arrange
        CatererEntity entity = new CatererEntity();

        // Act & Assert - should not throw exception
        assertDoesNotThrow(() -> mapper.updateEntityFromDTO(null, entity));
    }

    @Test
    void testUpdateEntityFromDTOPreservesNullAccountStatus() {
        // Arrange
        CatererEntity entity = CatererEntity.builder()
                .id(5L)
                .businessName("Test")
                .email("test@example.com")
                .password("password")
                .accountStatus("INACTIVE")
                .build();

        CatererDTO dto = CatererDTO.builder()
                .businessName("Updated")
                .email("updated@example.com")
                .password("newPassword")
                .accountStatus(null)
                .build();

        // Act
        mapper.updateEntityFromDTO(dto, entity);

        // Assert
        assertEquals("INACTIVE", entity.getAccountStatus()); // Should remain unchanged
        assertEquals("Updated", entity.getBusinessName());
    }

    @Test
    void testRoundTripConversion() {
        // Arrange
        CatererDTO originalDTO = CatererDTO.builder()
                .id(6L)
                .businessName("Round Trip Catering")
                .email("roundtrip@example.com")
                .password("roundTripPassword")
                .stripeCustomerId("cus_roundtrip")
                .accountStatus("ACTIVE")
                .build();

        // Act
        CatererEntity entity = mapper.toEntity(originalDTO);
        CatererDTO resultDTO = mapper.toDTO(entity);

        // Assert
        assertEquals(originalDTO.getId(), resultDTO.getId());
        assertEquals(originalDTO.getBusinessName(), resultDTO.getBusinessName());
        assertEquals(originalDTO.getEmail(), resultDTO.getEmail());
        assertEquals(originalDTO.getPassword(), resultDTO.getPassword());
        assertEquals(originalDTO.getStripeCustomerId(), resultDTO.getStripeCustomerId());
        assertEquals(originalDTO.getAccountStatus(), resultDTO.getAccountStatus());
    }
}

