package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.CatererEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CatererRepository extends JpaRepository<CatererEntity, Long> {

    /**
     * Find a caterer by email address
     * @param email the caterer's email
     * @return Optional containing the caterer if found
     */
    Optional<CatererEntity> findByEmail(String email);

    /**
     * Find all caterers by account status
     * @param accountStatus the account status (e.g., "ACTIVE", "INACTIVE", "SUSPENDED")
     * @return List of caterers with the specified status
     */
    List<CatererEntity> findByAccountStatus(String accountStatus);

    /**
     * Find caterers by business name (case-insensitive)
     * @param businessName the business name
     * @return List of caterers matching the business name
     */
    List<CatererEntity> findByBusinessNameIgnoreCase(String businessName);

    /**
     * Check if a caterer with the given email exists
     * @param email the email to check
     * @return true if a caterer with this email exists, false otherwise
     */
    boolean existsByEmail(String email);

    /**
     * Find caterers by Stripe customer ID
     * @param stripeCustomerId the Stripe customer ID
     * @return Optional containing the caterer if found
     */
    Optional<CatererEntity> findByStripeCustomerId(String stripeCustomerId);
}

