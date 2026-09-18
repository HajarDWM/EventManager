package com.example.eventmanager.infrastructure.persistence.mapper;

import com.example.eventmanager.domain.model.Client;
import com.example.eventmanager.infrastructure.persistence.entity.ClientEntity;
import org.springframework.stereotype.Component;

@Component
public class ClientPersistenceMapper {

    public Client toDomain(ClientEntity entity) {
        if (entity == null) {
            return null;
        }

        return Client.builder()
                .id(entity.getId())
                .name(entity.getName())
                .email(entity.getEmail())
                .phone(entity.getPhone())
                .accessLinkToken(entity.getAccessLinkToken())
                .accessLinkExpiresAt(entity.getAccessLinkExpiresAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public ClientEntity toEntity(Client domain) {
        if (domain == null) {
            return null;
        }

        return ClientEntity.builder()
                .id(domain.getId())
                .name(domain.getName())
                .email(domain.getEmail())
                .phone(domain.getPhone())
                .accessLinkToken(domain.getAccessLinkToken())
                .accessLinkExpiresAt(domain.getAccessLinkExpiresAt())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
