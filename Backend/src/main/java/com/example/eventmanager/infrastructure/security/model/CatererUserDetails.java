package com.example.eventmanager.infrastructure.security.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class CatererUserDetails extends User {

    private final Long catererId;

    public CatererUserDetails(String username, String password, Collection<? extends GrantedAuthority> authorities, Long catererId) {
        super(username, password, authorities);
        this.catererId = catererId;
    }

    public Long getCatererId() {
        return catererId;
    }
}
