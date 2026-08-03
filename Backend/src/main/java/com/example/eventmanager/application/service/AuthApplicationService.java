package com.example.eventmanager.application.service;

import com.example.eventmanager.application.port.in.LoginUseCase;
import com.example.eventmanager.application.port.out.CatererRepositoryPort;
import com.example.eventmanager.application.port.out.JwtServicePort;
import com.example.eventmanager.application.port.out.PasswordEncoderPort;
import com.example.eventmanager.domain.exception.AccountPendingApprovalException;
import com.example.eventmanager.domain.exception.CatererNotFoundException;
import com.example.eventmanager.domain.model.AuthCredentials;
import com.example.eventmanager.domain.model.Caterer;
import com.example.eventmanager.domain.model.CatererStatus;
import com.example.eventmanager.domain.model.JwtToken;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthApplicationService implements LoginUseCase {

    private final CatererRepositoryPort catererRepositoryPort;
    private final PasswordEncoderPort passwordEncoderPort;
    private final JwtServicePort jwtServicePort;

    @Override
    public JwtToken login(AuthCredentials credentials) {
        Caterer caterer = catererRepositoryPort.findByEmail(credentials.getEmail())
                .orElseThrow(() -> new CatererNotFoundException(credentials.getEmail()));

        if (!passwordEncoderPort.matches(credentials.getPassword(), caterer.getPassword())) {
            throw new RuntimeException("Mot de passe incorrect"); // Dans l'idéal, une exception domaine spécifique
        }

        return jwtServicePort.generateToken(caterer);
    }
}
