package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.application.dto.ChangePasswordDTO;
import com.example.eventmanager.application.mapper.CatererMapper;
import com.example.eventmanager.application.port.in.CreateCatererUseCase;
import com.example.eventmanager.application.port.in.GetCatererUseCase;
import com.example.eventmanager.application.port.in.UpdateCatererProfileUseCase;
import com.example.eventmanager.application.port.out.CatererRepositoryPort;
import com.example.eventmanager.application.port.out.PasswordEncoderPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.exception.CatererAlreadyExistsException;
import com.example.eventmanager.domain.exception.CatererNotFoundException;
import com.example.eventmanager.domain.model.Caterer;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CatererApplicationService implements CreateCatererUseCase, GetCatererUseCase, UpdateCatererProfileUseCase {

    private final CatererRepositoryPort catererRepositoryPort;
    private final CatererMapper catererMapper;
    private final PasswordEncoderPort passwordEncoderPort;
    private final SecurityContextPort securityContextPort;

    @Override
    @Transactional
    public CatererDTO createCaterer(CatererDTO catererDTO) {
        if (catererRepositoryPort.existsByEmail(catererDTO.getEmail())) {
            throw new CatererAlreadyExistsException(catererDTO.getEmail());
        }

        // Hacher le mot de passe avant de créer l'objet domaine
        String encodedPassword = passwordEncoderPort.encode(catererDTO.getPassword());
        catererDTO.setPassword(encodedPassword);
        catererDTO.setRole("TRAITEUR");
        catererDTO.setSubscriptionPlan("FREE");
        catererDTO.setSubscriptionStatus("ACTIVE");

        Caterer catererToSave = catererMapper.toDomain(catererDTO);
        
        // Par défaut, un nouveau compte est actif
        catererToSave.activateAccount();

        Caterer savedCaterer = catererRepositoryPort.save(catererToSave);

        return catererMapper.toDTO(savedCaterer);
    }

    @Override
    @Transactional(readOnly = true)
    public CatererDTO getCurrentCatererProfile() {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Caterer caterer = catererRepositoryPort.findById(currentCatererId)
                .orElseThrow(() -> new CatererNotFoundException(currentCatererId));
        return catererMapper.toDTO(caterer);
    }

    @Override
    @Transactional
    public CatererDTO updateCatererProfile(CatererDTO catererDTO) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Caterer caterer = catererRepositoryPort.findById(currentCatererId)
                .orElseThrow(() -> new CatererNotFoundException(currentCatererId));

        if (catererDTO.getBusinessName() != null && !catererDTO.getBusinessName().isBlank()) {
            caterer.updateBusinessName(catererDTO.getBusinessName());
        }

        Caterer updated = catererRepositoryPort.save(caterer);
        return catererMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordDTO changePasswordDTO) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Caterer caterer = catererRepositoryPort.findById(currentCatererId)
                .orElseThrow(() -> new CatererNotFoundException(currentCatererId));

        if (!passwordEncoderPort.matches(changePasswordDTO.getCurrentPassword(), caterer.getPassword())) {
            throw new IllegalArgumentException("L'ancien mot de passe est incorrect.");
        }

        String newEncodedPassword = passwordEncoderPort.encode(changePasswordDTO.getNewPassword());
        caterer.updatePassword(newEncodedPassword);
        catererRepositoryPort.save(caterer);
    }

    @Override
    @Transactional(readOnly = true)
    public CatererDTO getCatererById(Long id) {
        Caterer caterer = catererRepositoryPort.findById(id)
                .orElseThrow(() -> new CatererNotFoundException(id));
        return catererMapper.toDTO(caterer);
    }

    @Override
    @Transactional(readOnly = true)
    public CatererDTO getCatererByEmail(String email) {
        Caterer caterer = catererRepositoryPort.findByEmail(email)
                .orElseThrow(() -> new CatererNotFoundException(email));
        return catererMapper.toDTO(caterer);
    }
}
