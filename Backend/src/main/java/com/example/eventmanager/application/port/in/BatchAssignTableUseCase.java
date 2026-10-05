package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.GuestDTO;
import java.util.List;

public interface BatchAssignTableUseCase {
    List<GuestDTO> batchAssignTableByGroup(Long eventId, String groupName, String tableNumber, boolean confirmedOnly);
}
