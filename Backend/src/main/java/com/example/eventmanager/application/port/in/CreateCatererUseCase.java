package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.CatererDTO;

public interface CreateCatererUseCase {
    
    CatererDTO createCaterer(CatererDTO catererDTO);
}
