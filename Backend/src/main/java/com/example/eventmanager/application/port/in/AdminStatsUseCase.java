package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.AdminStatsDTO;

public interface AdminStatsUseCase {
    AdminStatsDTO getGlobalStats();
}
