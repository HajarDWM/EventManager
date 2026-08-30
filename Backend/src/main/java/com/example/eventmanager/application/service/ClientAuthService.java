package com.example.eventmanager.application.service;

import com.example.eventmanager.application.port.out.JwtServicePort;
import com.example.eventmanager.domain.model.Client;
import com.example.eventmanager.domain.model.JwtToken;
import com.example.eventmanager.infrastructure.persistence.mapper.ClientPersistenceMapper;
import com.example.eventmanager.infrastructure.persistence.repository.ClientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClientAuthService {

    private final ClientRepository clientRepository;
    private final ClientPersistenceMapper clientMapper;
    private final JwtServicePort jwtServicePort;

    public Optional<JwtToken> authenticate(String accessLinkToken) {
        return clientRepository.findByAccessLinkToken(accessLinkToken)
                .map(clientMapper::toDomain)
                .map(jwtServicePort::generateClientToken);
    }
}
