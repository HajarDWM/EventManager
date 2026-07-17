package com.example.eventmanager.application.port.in;

import com.example.eventmanager.domain.model.AuthCredentials;
import com.example.eventmanager.domain.model.JwtToken;

public interface LoginUseCase {
    JwtToken login(AuthCredentials credentials);
}
