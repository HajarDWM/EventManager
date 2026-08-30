package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.GuestDTO;
import com.example.eventmanager.infrastructure.persistence.entity.EventEntity;
import com.example.eventmanager.infrastructure.persistence.entity.GuestEntity;
import com.example.eventmanager.infrastructure.persistence.repository.EventRepository;
import com.example.eventmanager.infrastructure.persistence.repository.JpaGuestRepository;
import com.example.eventmanager.infrastructure.security.model.ClientUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/client/events/{eventId}/guests")
@RequiredArgsConstructor
public class ClientGuestController {

    private final JpaGuestRepository guestRepository;
    private final EventRepository eventRepository;

    private boolean isClientAuthorizedForEvent(Long clientId, Long eventId) {
        EventEntity event = eventRepository.findById(eventId).orElse(null);
        return event != null && clientId.equals(event.getClientId());
    }

    @GetMapping
    public ResponseEntity<?> getGuests(
            @PathVariable Long eventId,
            @AuthenticationPrincipal ClientUserDetails clientDetails) {

        if (!isClientAuthorizedForEvent(clientDetails.getClientId(), eventId)) {
            return ResponseEntity.status(403).body("Access denied to this event");
        }

        List<GuestEntity> guests = guestRepository.findByEventId(eventId);
        List<GuestDTO> dtos = guests.stream().map(this::toDTO).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/template")
    public ResponseEntity<byte[]> getGuestsTemplate(@PathVariable Long eventId,
                                                    @AuthenticationPrincipal ClientUserDetails clientDetails) {
        if (!isClientAuthorizedForEvent(clientDetails.getClientId(), eventId)) {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }

        try (org.apache.poi.xssf.usermodel.XSSFWorkbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook()) {
            org.apache.poi.xssf.usermodel.XSSFSheet sheet = workbook.createSheet("Invités");

            // Header row
            org.apache.poi.xssf.usermodel.XSSFRow headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Nom Complet");
            headerRow.createCell(1).setCellValue("Téléphone");
            headerRow.createCell(2).setCellValue("Email");
            headerRow.createCell(3).setCellValue("Groupe");

            // Auto-size columns
            for (int i = 0; i < 4; i++) {
                sheet.autoSizeColumn(i);
            }

            // Predefined groups dropdown validation (on D2:D1000)
            String[] groups = {
                "Famille Proche", "Famille Élargie", "Amis & Proches", "Hommes", "Femmes",
                "VIP", "Enfants", "Direction / Management", "Partenaires / Clients VIP",
                "Équipe Interne / Salariés", "Presse / Médias", "Invités Externes",
                "VIP / Sponsors", "Table d'Honneur", "Grand Public / Standard",
                "Presse & Officiels", "Staff / Organisateurs"
            };

            org.apache.poi.xssf.usermodel.XSSFSheet groupsSheet = workbook.createSheet("PredefinedGroups");
            for (int i = 0; i < groups.length; i++) {
                org.apache.poi.xssf.usermodel.XSSFRow row = groupsSheet.createRow(i);
                row.createCell(0).setCellValue(groups[i]);
            }
            workbook.setSheetHidden(workbook.getSheetIndex("PredefinedGroups"), true);

            org.apache.poi.ss.usermodel.DataValidationHelper validationHelper = sheet.getDataValidationHelper();
            org.apache.poi.ss.usermodel.DataValidationConstraint constraint = validationHelper.createFormulaListConstraint("=PredefinedGroups!$A$1:$A$" + groups.length);
            org.apache.poi.ss.util.CellRangeAddressList addressList = new org.apache.poi.ss.util.CellRangeAddressList(1, 999, 3, 3); // Rows 2 to 1000, Column D (index 3)
            org.apache.poi.ss.usermodel.DataValidation validation = validationHelper.createValidation(constraint, addressList);
            
            validation.setShowErrorBox(false);

            sheet.addValidationData(validation);

            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            workbook.write(out);
            byte[] excelBytes = out.toByteArray();

            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDisposition(org.springframework.http.ContentDisposition.builder("attachment")
                    .filename("modele_invites.xlsx")
                    .build());

            return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
        } catch (java.io.IOException e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping
    public ResponseEntity<?> addGuest(
            @PathVariable Long eventId,
            @RequestBody GuestDTO guestDTO,
            @AuthenticationPrincipal ClientUserDetails clientDetails) {

        if (!isClientAuthorizedForEvent(clientDetails.getClientId(), eventId)) {
            return ResponseEntity.status(403).body("Access denied to this event");
        }

        GuestEntity entity = toEntity(guestDTO);
        entity.setEventId(eventId);
        GuestEntity saved = guestRepository.save(entity);
        return ResponseEntity.ok(toDTO(saved));
    }

    @PutMapping("/{guestId}")
    public ResponseEntity<?> updateGuest(
            @PathVariable Long eventId,
            @PathVariable Long guestId,
            @RequestBody GuestDTO guestDTO,
            @AuthenticationPrincipal ClientUserDetails clientDetails) {

        if (!isClientAuthorizedForEvent(clientDetails.getClientId(), eventId)) {
            return ResponseEntity.status(403).body("Access denied to this event");
        }

        return guestRepository.findById(guestId)
                .map(existing -> {
                    if (!existing.getEventId().equals(eventId)) {
                        return ResponseEntity.badRequest().body("Guest does not belong to this event");
                    }
                    existing.setFullName(guestDTO.getFullName());
                    existing.setEmail(guestDTO.getEmail());
                    existing.setPhone(guestDTO.getPhone());
                    if (guestDTO.getStatus() != null) {
                        existing.setStatus(guestDTO.getStatus().name());
                    }
                    existing.setTableNumber(guestDTO.getTableNumber());
                    existing.setDietaryRequirements(guestDTO.getDietaryRequirements());
                    existing.setGroupName(guestDTO.getGroupName());
                    GuestEntity saved = guestRepository.save(existing);
                    return ResponseEntity.ok((Object) toDTO(saved));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{guestId}")
    public ResponseEntity<?> deleteGuest(
            @PathVariable Long eventId,
            @PathVariable Long guestId,
            @AuthenticationPrincipal ClientUserDetails clientDetails) {

        if (!isClientAuthorizedForEvent(clientDetails.getClientId(), eventId)) {
            return ResponseEntity.status(403).body("Access denied to this event");
        }

        return guestRepository.findById(guestId)
                .map(existing -> {
                    if (!existing.getEventId().equals(eventId)) {
                        return ResponseEntity.badRequest().body("Guest does not belong to this event");
                    }
                    guestRepository.delete(existing);
                    return ResponseEntity.ok().build();
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private GuestDTO toDTO(GuestEntity entity) {
        GuestDTO dto = new GuestDTO();
        dto.setId(entity.getId());
        dto.setEventId(entity.getEventId());
        dto.setFullName(entity.getFullName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setStatus(entity.getStatus() != null ? com.example.eventmanager.domain.model.GuestStatus.valueOf(entity.getStatus()) : null);
        dto.setTableNumber(entity.getTableNumber());
        dto.setDietaryRequirements(entity.getDietaryRequirements());
        dto.setGroupName(entity.getGroupName());
        dto.setPaymentStatus(entity.getPaymentStatus());
        dto.setPaidAmount(entity.getPaidAmount());
        dto.setPaymentReference(entity.getPaymentReference());
        dto.setPaymentDate(entity.getPaymentDate());
        return dto;
    }

    private GuestEntity toEntity(GuestDTO dto) {
        GuestEntity entity = new GuestEntity();
        entity.setFullName(dto.getFullName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setStatus(dto.getStatus() != null ? dto.getStatus().name() : "PENDING");
        entity.setTableNumber(dto.getTableNumber());
        entity.setDietaryRequirements(dto.getDietaryRequirements());
        entity.setGroupName(dto.getGroupName());
        return entity;
    }
}
