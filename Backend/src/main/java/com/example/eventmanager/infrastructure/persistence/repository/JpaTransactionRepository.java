package com.example.eventmanager.infrastructure.persistence.repository;

import com.example.eventmanager.infrastructure.persistence.entity.TransactionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface JpaTransactionRepository extends JpaRepository<TransactionEntity, String> {

    @Query("SELECT t FROM TransactionEntity t WHERE " +
           "LOWER(t.businessName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.id) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.subscriptionPlan) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<TransactionEntity> searchTransactions(@Param("search") String search, Pageable pageable);

    @Query("SELECT t FROM TransactionEntity t WHERE " +
           "(LOWER(t.businessName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.id) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.subscriptionPlan) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "t.paymentDate >= :sinceDate")
    Page<TransactionEntity> searchTransactionsSince(@Param("search") String search, @Param("sinceDate") java.time.LocalDateTime sinceDate, Pageable pageable);

    @Query("SELECT t FROM TransactionEntity t WHERE t.paymentDate >= :sinceDate")
    Page<TransactionEntity> findAllSince(@Param("sinceDate") java.time.LocalDateTime sinceDate, Pageable pageable);

    java.util.List<TransactionEntity> findByPaymentStatusAndPaymentDateAfter(String status, java.time.LocalDateTime sinceDate);

    java.util.List<TransactionEntity> findByCatererIdOrderByPaymentDateDesc(Long catererId);
}
