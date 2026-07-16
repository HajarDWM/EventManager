package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.port.out.CatererRepositoryPort;
import com.example.eventmanager.domain.model.Caterer;
import com.example.eventmanager.infrastructure.persistence.entity.CatererEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.CatererPersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.CatererRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class CatererRepositoryAdapter implements CatererRepositoryPort {

    private final CatererRepository catererRepository;
    private final CatererPersistenceMapper persistenceMapper;

    @Override
    public Caterer save(Caterer caterer) {
        CatererEntity entity = persistenceMapper.toEntity(caterer);
        CatererEntity savedEntity = catererRepository.save(entity);
        return persistenceMapper.toDomain(savedEntity);
    }

    @Override
    public Optional<Caterer> findById(Long id) {
        return catererRepository.findById(id)
                .map(persistenceMapper::toDomain);
    }

    @Override
    public Optional<Caterer> findByEmail(String email) {
        return catererRepository.findByEmail(email)
                .map(persistenceMapper::toDomain);
    }

    @Override
    public boolean existsByEmail(String email) {
        return catererRepository.existsByEmail(email);
    }
}
