package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.port.in.CreateCatererUseCase;
import com.example.eventmanager.application.port.in.LoginUseCase;
import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.domain.model.AuthCredentials;
import com.example.eventmanager.domain.model.JwtToken;
import com.example.eventmanager.domain.exception.AccountPendingApprovalException;
import com.example.eventmanager.presentation.dto.LoginRequestDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final CreateCatererUseCase createCatererUseCase;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            AuthCredentials credentials = new AuthCredentials(request.getEmail(), request.getPassword());
            JwtToken token = loginUseCase.login(credentials);
            return ResponseEntity.ok(Map.of("token", token.getToken()));
        } catch (AccountPendingApprovalException e) {
            String errorType = e.getMessage().contains("suspended") ? "ACCOUNT_SUSPENDED" : "ACCOUNT_PENDING_APPROVAL";
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                "error", errorType,
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody CatererDTO request) {
        try {
            CatererDTO created = createCatererUseCase.createCaterer(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
