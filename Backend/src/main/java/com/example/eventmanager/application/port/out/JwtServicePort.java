package com.example.eventmanager.application.port.out;

import com.example.eventmanager.domain.model.Caterer;
import com.example.eventmanager.domain.model.JwtToken;

public interface JwtServicePort {
    JwtToken generateToken(Caterer caterer);
    JwtToken generateClientToken(com.example.eventmanager.domain.model.Client client);
    String extractEmail(String token);
    boolean isTokenValid(String token, String userEmail);
}
