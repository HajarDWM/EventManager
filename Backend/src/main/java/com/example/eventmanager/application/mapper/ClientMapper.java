package com.example.eventmanager.application.mapper;

import com.example.eventmanager.application.dto.ClientDTO;
import com.example.eventmanager.domain.model.Client;
import org.springframework.stereotype.Component;

@Component
public class ClientMapper {

    public Client toDomain(ClientDTO dto) {
        if (dto == null) {
            return null;
        }

        return Client.builder()
                .id(dto.getId())
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .accessLinkToken(dto.getAccessLinkToken())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }

    public ClientDTO toDTO(Client domain) {
        if (domain == null) {
            return null;
        }

        return ClientDTO.builder()
                .id(domain.getId())
                .name(domain.getName())
                .email(domain.getEmail())
                .phone(domain.getPhone())
                .accessLinkToken(domain.getAccessLinkToken())
                .createdAt(domain.getCreatedAt())
                .updatedAt(domain.getUpdatedAt())
                .build();
    }
}
