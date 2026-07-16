package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.CatererDTO;
import com.example.eventmanager.application.port.in.CreateCatererUseCase;
import com.example.eventmanager.application.port.in.GetCatererUseCase;
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

    @PostMapping
    public ResponseEntity<CatererDTO> createCaterer(@RequestBody CatererDTO catererDTO) {
        CatererDTO created = createCatererUseCase.createCaterer(catererDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CatererDTO> getCatererById(@PathVariable Long id) {
        return ResponseEntity.ok(getCatererUseCase.getCatererById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<CatererDTO> getCatererByEmail(@PathVariable String email) {
        return ResponseEntity.ok(getCatererUseCase.getCatererByEmail(email));
    }
}
