package com.example.eventmanager.application.port.in;

import com.example.eventmanager.application.dto.CatererDTO;

public interface GetCatererUseCase {
    
    CatererDTO getCatererById(Long id);
    
    CatererDTO getCatererByEmail(String email);
}
