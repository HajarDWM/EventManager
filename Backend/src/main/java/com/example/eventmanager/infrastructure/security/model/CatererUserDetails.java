package com.example.eventmanager.infrastructure.security.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class CatererUserDetails extends User {

    private final Long catererId;
    private final String role;

    public CatererUserDetails(String username, String password, Collection<? extends GrantedAuthority> authorities, Long catererId, String role) {
        super(username, password, authorities);
        this.catererId = catererId;
        this.role = role;
    }

    public Long getCatererId() {
        return catererId;
    }

    public String getRole() {
        return role;
    }
}
