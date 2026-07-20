package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.application.dto.ChangePasswordDTO;

public interface UpdateCatererProfileUseCase {
    CatererDTO getCurrentCatererProfile();
    CatererDTO updateCatererProfile(CatererDTO catererDTO);
    void changePassword(ChangePasswordDTO changePasswordDTO);
}
