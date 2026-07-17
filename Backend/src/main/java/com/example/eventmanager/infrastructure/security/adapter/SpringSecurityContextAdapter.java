package com.example.eventmanager.infrastructure.security.adapter;

import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.infrastructure.security.model.CatererUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SpringSecurityContextAdapter implements SecurityContextPort {

    @Override
    public Long getCurrentCatererId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || 
            "anonymousUser".equals(authentication.getPrincipal())) {
            throw new RuntimeException("Utilisateur non authentifié");
        }

        Object principal = authentication.getPrincipal();
        
        if (principal instanceof CatererUserDetails) {
            return ((CatererUserDetails) principal).getCatererId();
        }

        throw new RuntimeException("Principal n'est pas de type CatererUserDetails");
    }
}
