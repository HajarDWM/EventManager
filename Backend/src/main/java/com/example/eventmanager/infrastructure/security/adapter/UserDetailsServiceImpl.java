package com.example.eventmanager.infrastructure.security.adapter;

import com.example.eventmanager.application.port.out.CatererRepositoryPort;
import com.example.eventmanager.domain.model.Caterer;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final CatererRepositoryPort catererRepositoryPort;
    private final com.example.eventmanager.infrastructure.persistence.repository.ClientRepository clientRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username != null && username.startsWith("CLIENT_")) {
            String token = username.substring(7);
            com.example.eventmanager.infrastructure.persistence.entity.ClientEntity client = 
                clientRepository.findByAccessLinkToken(token)
                    .orElseThrow(() -> new UsernameNotFoundException("Client introuvable"));
            return new com.example.eventmanager.infrastructure.security.model.ClientUserDetails(
                username, 
                List.of(new SimpleGrantedAuthority("ROLE_CLIENT")), 
                client.getId()
            );
        }

        Caterer caterer = catererRepositoryPort.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Traiteur introuvable avec l'email: " + username));

        String roleName = caterer.getRole() != null ? caterer.getRole().name() : "TRAITEUR";
        List<GrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_" + roleName));

        return new com.example.eventmanager.infrastructure.security.model.CatererUserDetails(
                caterer.getEmail(),
                caterer.getPassword(),
                authorities,
                caterer.getId(),
                roleName,
                caterer.getAccountStatus() != null ? caterer.getAccountStatus().name() : "PENDING"
        );
    }
}
