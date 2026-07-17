package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.port.in.LoginUseCase;
import com.example.eventmanager.domain.model.AuthCredentials;
import com.example.eventmanager.domain.model.JwtToken;
import com.example.eventmanager.presentation.dto.LoginRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthResource {

    private final LoginUseCase loginUseCase;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            AuthCredentials credentials = new AuthCredentials(request.getEmail(), request.getPassword());
            JwtToken token = loginUseCase.login(credentials);
            return ResponseEntity.ok(Map.of("token", token.getToken()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }
}
