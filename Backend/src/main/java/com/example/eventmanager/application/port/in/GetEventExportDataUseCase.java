package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.EventExportDTO;

public interface GetEventExportDataUseCase {
    EventExportDTO getEventExportData(Long eventId);
}
