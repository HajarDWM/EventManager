package com.example.eventmanager.domain.model;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class Client {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String accessLinkToken;
    private LocalDateTime accessLinkExpiresAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
