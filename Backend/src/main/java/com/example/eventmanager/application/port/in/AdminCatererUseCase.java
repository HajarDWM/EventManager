package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.CatererDTO;

import java.util.List;

public interface AdminCatererUseCase {
    List<CatererDTO> getAllCaterers();
    CatererDTO updateCatererStatusAndSubscription(Long id, String accountStatus, String plan, String subscriptionStatus);
}
