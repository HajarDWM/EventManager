package com.example.eventmanager.infrastructure.security.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class ClientUserDetails extends User {

    private final Long clientId;

    public ClientUserDetails(String username, Collection<? extends GrantedAuthority> authorities, Long clientId) {
        super(username, "", authorities);
        this.clientId = clientId;
    }

    public Long getClientId() {
        return clientId;
    }
}
