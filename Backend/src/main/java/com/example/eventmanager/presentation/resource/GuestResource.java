package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.GuestDTO;
import com.example.eventmanager.application.port.in.CreateGuestUseCase;
import com.example.eventmanager.application.port.in.DeleteGuestUseCase;
import com.example.eventmanager.application.port.in.GetGuestsByEventUseCase;
import com.example.eventmanager.application.port.in.UpdateGuestUseCase;
import com.example.eventmanager.application.port.in.ImportGuestsUseCase;
import org.springframework.web.multipart.MultipartFile;
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
    private final ImportGuestsUseCase importGuestsUseCase;

    @GetMapping("/events/{eventId}/guests/template")
    public ResponseEntity<byte[]> getGuestsTemplate(@PathVariable Long eventId) {
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

    @PostMapping("/events/{eventId}/guests/import")
    public ResponseEntity<List<GuestDTO>> importGuests(
            @PathVariable Long eventId,
            @RequestParam("file") MultipartFile file) {
        try {
            List<GuestDTO> imported = importGuestsUseCase.importGuests(eventId, file.getInputStream(), file.getOriginalFilename());
            return ResponseEntity.ok(imported);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'importation : " + e.getMessage(), e);
        }
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
