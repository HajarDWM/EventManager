package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.BillingSetting;

import java.util.Optional;

public interface BillingSettingRepositoryPort {
    BillingSetting save(BillingSetting setting);
    Optional<BillingSetting> findById(Long id);
}
