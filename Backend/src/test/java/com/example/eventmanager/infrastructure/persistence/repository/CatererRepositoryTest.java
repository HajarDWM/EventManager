package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.CatererEntity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class CatererRepositoryTest {

    @Autowired
    private CatererRepository catererRepository;

    private CatererEntity testCaterer;

    @BeforeEach
    void setUp() {
        catererRepository.deleteAll();

        testCaterer = CatererEntity.builder()
                .businessName("Test Catering")
                .email("test@catering.com")
                .password("hashedPassword123")
                .stripeCustomerId("cus_test123")
                .accountStatus("APPROVED")
                .build();
    }

    @Test
    void testSaveAndFindById() {
        // Arrange & Act
        CatererEntity saved = catererRepository.save(testCaterer);

        // Assert
        assertNotNull(saved.getId());
        Optional<CatererEntity> found = catererRepository.findById(saved.getId());
        assertTrue(found.isPresent());
        assertEquals("Test Catering", found.get().getBusinessName());
    }

    @Test
    void testFindByEmail() {
        // Arrange
        catererRepository.save(testCaterer);

        // Act
        Optional<CatererEntity> found = catererRepository.findByEmail("test@catering.com");

        // Assert
        assertTrue(found.isPresent());
        assertEquals("Test Catering", found.get().getBusinessName());
    }

    @Test
    void testFindByEmailNotFound() {
        // Act
        Optional<CatererEntity> found = catererRepository.findByEmail("nonexistent@catering.com");

        // Assert
        assertFalse(found.isPresent());
    }

    @Test
    void testFindByAccountStatus() {
        // Arrange
        catererRepository.save(testCaterer);

        CatererEntity inactiveCaterer = CatererEntity.builder()
                .businessName("Inactive Catering")
                .email("inactive@catering.com")
                .password("hashedPassword123")
                .accountStatus("SUSPENDED")
                .build();
        catererRepository.save(inactiveCaterer);

        // Act
        List<CatererEntity> activeCaterers = catererRepository.findByAccountStatus("APPROVED");

        // Assert
        assertEquals(1, activeCaterers.size());
        assertEquals("Test Catering", activeCaterers.get(0).getBusinessName());
    }

    @Test
    void testFindByBusinessNameIgnoreCase() {
        // Arrange
        catererRepository.save(testCaterer);

        // Act
        List<CatererEntity> found = catererRepository.findByBusinessNameIgnoreCase("test catering");

        // Assert
        assertEquals(1, found.size());
        assertEquals("Test Catering", found.get(0).getBusinessName());
    }

    @Test
    void testExistsByEmail() {
        // Arrange
        catererRepository.save(testCaterer);

        // Act & Assert
        assertTrue(catererRepository.existsByEmail("test@catering.com"));
        assertFalse(catererRepository.existsByEmail("nonexistent@catering.com"));
    }

    @Test
    void testFindByStripeCustomerId() {
        // Arrange
        catererRepository.save(testCaterer);

        // Act
        Optional<CatererEntity> found = catererRepository.findByStripeCustomerId("cus_test123");

        // Assert
        assertTrue(found.isPresent());
        assertEquals("Test Catering", found.get().getBusinessName());
    }

    @Test
    void testUpdateCaterer() {
        // Arrange
        CatererEntity saved = catererRepository.save(testCaterer);
        saved.setBusinessName("Updated Catering");
        saved.setAccountStatus("SUSPENDED");

        // Act
        CatererEntity updated = catererRepository.save(saved);

        // Assert
        Optional<CatererEntity> found = catererRepository.findById(updated.getId());
        assertTrue(found.isPresent());
        assertEquals("Updated Catering", found.get().getBusinessName());
        assertEquals("SUSPENDED", found.get().getAccountStatus());
    }

    @Test
    void testDeleteCaterer() {
        // Arrange
        CatererEntity saved = catererRepository.save(testCaterer);
        Long id = saved.getId();

        // Act
        catererRepository.deleteById(id);

        // Assert
        Optional<CatererEntity> found = catererRepository.findById(id);
        assertFalse(found.isPresent());
    }

    @Test
    void testFindAll() {
        // Arrange
        CatererEntity caterer1 = testCaterer;
        CatererEntity caterer2 = CatererEntity.builder()
                .businessName("Another Catering")
                .email("another@catering.com")
                .password("hashedPassword456")
                .accountStatus("APPROVED")
                .build();

        catererRepository.save(caterer1);
        catererRepository.save(caterer2);

        // Act
        List<CatererEntity> all = catererRepository.findAll();

        // Assert
        assertEquals(2, all.size());
    }

    @Test
    void testEmailUniqueness() {
        // Arrange
        catererRepository.save(testCaterer);

        CatererEntity duplicateEmailCaterer = CatererEntity.builder()
                .businessName("Different Catering")
                .email("test@catering.com") // Same email
                .password("hashedPassword789")
                .accountStatus("APPROVED")
                .build();

        // Act & Assert - should throw exception due to unique constraint
        assertThrows(Exception.class, () -> {
            catererRepository.save(duplicateEmailCaterer);
            catererRepository.flush(); // Force flush to trigger constraint violation
        });
    }
}



