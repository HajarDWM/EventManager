package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.Caterer;

import java.util.Optional;

public interface CatererRepositoryPort {
    
    Caterer save(Caterer caterer);
    
    Optional<Caterer> findById(Long id);
    
    Optional<Caterer> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    java.util.List<Caterer> findAll();
    
    long count();
}
