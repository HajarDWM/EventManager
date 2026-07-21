package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.EventExportDTO;
import com.example.eventmanager.application.port.in.GetEventExportDataUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExportResource {

    private final GetEventExportDataUseCase getEventExportDataUseCase;

    @GetMapping("/events/{eventId}/export-data")
    public ResponseEntity<EventExportDTO> getEventExportData(@PathVariable Long eventId) {
        EventExportDTO data = getEventExportDataUseCase.getEventExportData(eventId);
        return ResponseEntity.ok(data);
    }
}
