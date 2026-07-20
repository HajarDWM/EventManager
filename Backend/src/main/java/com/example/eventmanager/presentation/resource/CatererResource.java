package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.application.dto.ChangePasswordDTO;
import com.example.eventmanager.application.port.in.CreateCatererUseCase;
import com.example.eventmanager.application.port.in.GetCatererUseCase;
import com.example.eventmanager.application.port.in.UpdateCatererProfileUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/caterers")
@RequiredArgsConstructor
public class CatererResource {

    private final CreateCatererUseCase createCatererUseCase;
    private final GetCatererUseCase getCatererUseCase;
    private final UpdateCatererProfileUseCase updateCatererProfileUseCase;

    @PostMapping
    public ResponseEntity<CatererDTO> createCaterer(@RequestBody CatererDTO catererDTO) {
        CatererDTO created = createCatererUseCase.createCaterer(catererDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/me")
    public ResponseEntity<CatererDTO> getCurrentCatererProfile() {
        return ResponseEntity.ok(updateCatererProfileUseCase.getCurrentCatererProfile());
    }

    @PutMapping("/me")
    public ResponseEntity<CatererDTO> updateCurrentCatererProfile(@RequestBody CatererDTO catererDTO) {
        return ResponseEntity.ok(updateCatererProfileUseCase.updateCatererProfile(catererDTO));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@RequestBody ChangePasswordDTO changePasswordDTO) {
        updateCatererProfileUseCase.changePassword(changePasswordDTO);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id:\\d+}")
    public ResponseEntity<CatererDTO> getCatererById(@PathVariable Long id) {
        return ResponseEntity.ok(getCatererUseCase.getCatererById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<CatererDTO> getCatererByEmail(@PathVariable String email) {
        return ResponseEntity.ok(getCatererUseCase.getCatererByEmail(email));
    }
}
