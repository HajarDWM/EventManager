package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.GuestDTO;
import com.example.eventmanager.application.port.in.CreateGuestUseCase;
import com.example.eventmanager.application.port.in.DeleteGuestUseCase;
import com.example.eventmanager.application.port.in.GetGuestsByEventUseCase;
import com.example.eventmanager.application.port.in.UpdateGuestUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GuestResource {

    private final CreateGuestUseCase createGuestUseCase;
    private final GetGuestsByEventUseCase getGuestsByEventUseCase;
    private final UpdateGuestUseCase updateGuestUseCase;
    private final DeleteGuestUseCase deleteGuestUseCase;

    @GetMapping("/events/{eventId}/guests/template")
    public ResponseEntity<byte[]> getGuestsTemplate(@PathVariable Long eventId) {
        String csvContent = "\uFEFFNom Complet;Téléphone;Email;Groupe\r\n" +
                "Jean Dupont (Exemple);0612345678;jean.dupont@example.com;Famille Proche\r\n" +
                "Marie Martin (Exemple);0712345678;marie.martin@example.com;Amis\r\n" +
                "Alexandre Bernard (Exemple);0600000000;alexandre.b@example.com;VIP\r\n" +
                "Sophie Petit (Exemple);0611111111;sophie.p@example.com;Hommes\r\n" +
                "Julie Roux (Exemple);0622222222;julie.r@example.com;Femmes\r\n" +
                "Caterer Staff (Exemple);0633333333;staff@example.com;Staff\r\n";
        byte[] csvBytes = csvContent.getBytes(java.nio.charset.StandardCharsets.UTF_8);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setContentType(org.springframework.http.MediaType.parseMediaType("text/csv;charset=utf-8"));
        headers.setContentDisposition(org.springframework.http.ContentDisposition.builder("attachment")
                .filename("modele_invites.csv")
                .build());

        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }

    @GetMapping("/events/{eventId}/guests")
    public ResponseEntity<List<GuestDTO>> getGuestsByEvent(@PathVariable Long eventId) {
        return ResponseEntity.ok(getGuestsByEventUseCase.getGuestsByEventId(eventId));
    }

    @PostMapping("/events/{eventId}/guests")
    public ResponseEntity<GuestDTO> createGuest(@PathVariable Long eventId, @RequestBody GuestDTO guestDTO) {
        GuestDTO created = createGuestUseCase.createGuest(eventId, guestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/guests/{id}")
    public ResponseEntity<GuestDTO> updateGuest(@PathVariable Long id, @RequestBody GuestDTO guestDTO) {
        return ResponseEntity.ok(updateGuestUseCase.updateGuest(id, guestDTO));
    }

    @DeleteMapping("/guests/{id}")
    public ResponseEntity<Void> deleteGuest(@PathVariable Long id) {
        deleteGuestUseCase.deleteGuest(id);
        return ResponseEntity.noContent().build();
    }
}
