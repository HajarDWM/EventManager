package com.example.eventmanager.infrastructure.persistence.adapter;

import com.example.eventmanager.application.port.out.BillingSettingRepositoryPort;
import com.example.eventmanager.domain.model.BillingSetting;
import com.example.eventmanager.infrastructure.persistence.entity.BillingSettingEntity;
import com.example.eventmanager.infrastructure.persistence.mapper.BillingSettingPersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.BillingSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
@RequiredArgsConstructor
public class BillingSettingRepositoryAdapter implements BillingSettingRepositoryPort {

    private final BillingSettingRepository repository;
    private final BillingSettingPersistenceMapper mapper;

    @Override
    public BillingSetting save(BillingSetting setting) {
        BillingSettingEntity entity = mapper.toEntity(setting);
        BillingSettingEntity saved = repository.save(entity);
        return mapper.toDomain(saved);
    }

    @Override
    public Optional<BillingSetting> findById(Long id) {
        return repository.findById(id).map(mapper::toDomain);
    }
}
