package com.example.eventmanager.infrastructure.security.adapter;

import com.example.eventmanager.application.port.out.CatererRepositoryPort;
import com.example.eventmanager.domain.model.Caterer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final CatererRepositoryPort catererRepositoryPort;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Caterer caterer = catererRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Traiteur introuvable avec l'email: " + email));

        return new com.example.eventmanager.infrastructure.security.model.CatererUserDetails(
                caterer.getEmail(),
                caterer.getPassword(),
                Collections.emptyList(), // Pas de rôles pour l'instant
                caterer.getId()
        );
    }
}
