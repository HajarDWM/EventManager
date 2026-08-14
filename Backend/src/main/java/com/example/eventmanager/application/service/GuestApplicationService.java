package com.example.eventmanager.application.service;

import com.example.eventmanager.application.dto.GuestDTO;
import com.example.eventmanager.application.mapper.GuestMapper;
import com.example.eventmanager.application.port.in.CreateGuestUseCase;
import com.example.eventmanager.application.port.in.DeleteGuestUseCase;
import com.example.eventmanager.application.port.in.GetGuestsByEventUseCase;
import com.example.eventmanager.application.port.in.ImportGuestsUseCase;
import com.example.eventmanager.application.port.in.UpdateGuestUseCase;
import com.example.eventmanager.domain.model.GuestStatus;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import org.apache.poi.ss.usermodel.*;
import com.example.eventmanager.application.port.out.EventRepositoryPort;
import com.example.eventmanager.application.port.out.GuestRepositoryPort;
import com.example.eventmanager.application.port.out.SecurityContextPort;
import com.example.eventmanager.domain.exception.EventNotFoundException;
import com.example.eventmanager.domain.model.Event;
import com.example.eventmanager.domain.model.Guest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GuestApplicationService implements CreateGuestUseCase, GetGuestsByEventUseCase, UpdateGuestUseCase, DeleteGuestUseCase, ImportGuestsUseCase {

    private final GuestRepositoryPort guestRepositoryPort;
    private final EventRepositoryPort eventRepositoryPort;
    private final GuestMapper guestMapper;
    private final SecurityContextPort securityContextPort;

    private void verifyEventOwnership(Long eventId) {
        Long currentCatererId = securityContextPort.getCurrentCatererId();
        Event event = eventRepositoryPort.findById(eventId)
                .orElseThrow(() -> new EventNotFoundException(eventId));

        if (event.getCatererId() != null && !event.getCatererId().equals(currentCatererId)) {
            throw new RuntimeException("Accès non autorisé à cet événement");
        }
    }

    private void syncEventGuestCount(Long eventId) {
        Event event = eventRepositoryPort.findById(eventId).orElse(null);
        if (event != null) {
            long total = guestRepositoryPort.countByEventId(eventId);
            event.setGuestCount((int) total);
            eventRepositoryPort.save(event);
        }
    }

    @Override
    @Transactional
    public GuestDTO createGuest(Long eventId, GuestDTO guestDTO) {
        verifyEventOwnership(eventId);
        guestDTO.setEventId(eventId);
        Guest guestToSave = guestMapper.toDomain(guestDTO);
        Guest saved = guestRepositoryPort.save(guestToSave);
        syncEventGuestCount(eventId);
        return guestMapper.toDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GuestDTO> getGuestsByEventId(Long eventId) {
        verifyEventOwnership(eventId);
        return guestRepositoryPort.findByEventId(eventId).stream()
                .map(guestMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public GuestDTO updateGuest(Long guestId, GuestDTO guestDTO) {
        Guest existing = guestRepositoryPort.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Invité introuvable avec l'id: " + guestId));
        verifyEventOwnership(existing.getEventId());

        existing.updateDetails(
                guestDTO.getFullName(),
                guestDTO.getEmail(),
                guestDTO.getPhone(),
                guestDTO.getStatus(),
                guestDTO.getTableNumber(),
                guestDTO.getDietaryRequirements(),
                guestDTO.getGroupName()
        );

        if (guestDTO.getPaymentStatus() != null) {
            existing.setPaymentStatus(guestDTO.getPaymentStatus());
        }
        if (guestDTO.getPaidAmount() != null) {
            existing.setPaidAmount(guestDTO.getPaidAmount());
        }
        if (guestDTO.getPaymentReference() != null) {
            existing.setPaymentReference(guestDTO.getPaymentReference());
        }
        if (guestDTO.getPaymentDate() != null) {
            existing.setPaymentDate(guestDTO.getPaymentDate());
        }

        Guest updated = guestRepositoryPort.save(existing);
        return guestMapper.toDTO(updated);
    }

    @Override
    @Transactional
    public void deleteGuest(Long guestId) {
        Guest existing = guestRepositoryPort.findById(guestId)
                .orElseThrow(() -> new RuntimeException("Invité introuvable avec l'id: " + guestId));
        Long eventId = existing.getEventId();
        verifyEventOwnership(eventId);

        guestRepositoryPort.deleteById(guestId);
        syncEventGuestCount(eventId);
    }

    @Override
    @Transactional
    public List<GuestDTO> importGuests(Long eventId, InputStream fileInputStream, String filename) {
        verifyEventOwnership(eventId);
        List<GuestDTO> parsedGuests = new ArrayList<>();
        try {
            if (filename != null && filename.toLowerCase().endsWith(".xlsx")) {
                parsedGuests = parseExcel(fileInputStream);
            } else {
                parsedGuests = parseCsv(fileInputStream);
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la lecture du fichier : " + e.getMessage(), e);
        }

        List<GuestDTO> savedGuests = new ArrayList<>();
        for (GuestDTO dto : parsedGuests) {
            dto.setEventId(eventId);
            Guest guestToSave = guestMapper.toDomain(dto);
            Guest saved = guestRepositoryPort.save(guestToSave);
            savedGuests.add(guestMapper.toDTO(saved));
        }

        syncEventGuestCount(eventId);
        return savedGuests;
    }

    private List<GuestDTO> parseExcel(InputStream is) throws Exception {
        List<GuestDTO> list = new ArrayList<>();
        try (Workbook workbook = WorkbookFactory.create(is)) {
            Sheet sheet = workbook.getSheetAt(0);
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new IllegalArgumentException("Le fichier Excel est vide.");
            }

            int fullNameIdx = -1;
            int phoneIdx = -1;
            int emailIdx = -1;
            int groupIdx = -1;

            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                if (cell == null) continue;
                String header = cell.getStringCellValue().trim().toLowerCase();
                if (header.contains("nom complet") || header.contains("fullname") || header.equals("name") || header.equals("nom")) {
                    fullNameIdx = i;
                } else if (header.contains("téléphone") || header.contains("telephone") || header.contains("phone") || header.contains("tel")) {
                    phoneIdx = i;
                } else if (header.contains("email") || header.contains("courriel") || header.contains("mail")) {
                    emailIdx = i;
                } else if (header.contains("groupe") || header.contains("group")) {
                    groupIdx = i;
                }
            }

            if (fullNameIdx == -1) {
                throw new IllegalArgumentException("Colonne 'Nom Complet' non trouvée.");
            }

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;

                Cell nameCell = row.getCell(fullNameIdx);
                String fullName = getCellValueAsString(nameCell);
                if (fullName == null || fullName.trim().isEmpty() || fullName.contains("(Exemple)") || fullName.contains("(Example)")) {
                    continue;
                }

                String phone = phoneIdx != -1 ? getCellValueAsString(row.getCell(phoneIdx)) : "";
                String email = emailIdx != -1 ? getCellValueAsString(row.getCell(emailIdx)) : "";
                String group = groupIdx != -1 ? getCellValueAsString(row.getCell(groupIdx)) : "";

                GuestDTO guest = new GuestDTO();
                guest.setFullName(fullName);
                guest.setPhone(phone);
                guest.setEmail(email);
                guest.setGroupName(group);
                guest.setStatus(GuestStatus.PENDING);
                list.add(guest);
            }
        }
        return list;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue().trim();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                double numericValue = cell.getNumericCellValue();
                if (numericValue == (long) numericValue) {
                    return String.valueOf((long) numericValue);
                }
                return String.valueOf(numericValue);
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception e) {
                    return String.valueOf(cell.getNumericCellValue());
                }
            default:
                return "";
        }
    }

    private List<GuestDTO> parseCsv(InputStream is) throws Exception {
        List<GuestDTO> list = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String headerLine = reader.readLine();
            if (headerLine == null) {
                throw new IllegalArgumentException("Le fichier CSV est vide.");
            }

            if (headerLine.startsWith("\uFEFF")) {
                headerLine = headerLine.substring(1);
            }

            String sep = ";";
            if (headerLine.contains(";") && !headerLine.contains(",")) {
                sep = ";";
            } else if (headerLine.contains(",") && !headerLine.contains(";")) {
                sep = ",";
            } else {
                sep = headerLine.contains(";") ? ";" : ",";
            }

            String[] headers = headerLine.split(sep);
            int fullNameIdx = -1;
            int phoneIdx = -1;
            int emailIdx = -1;
            int groupIdx = -1;

            for (int i = 0; i < headers.length; i++) {
                String header = headers[i].trim().toLowerCase().replace("\"", "");
                if (header.contains("nom complet") || header.contains("fullname") || header.equals("name") || header.equals("nom")) {
                    fullNameIdx = i;
                } else if (header.contains("téléphone") || header.contains("telephone") || header.contains("phone") || header.contains("tel")) {
                    phoneIdx = i;
                } else if (header.contains("email") || header.contains("courriel") || header.contains("mail")) {
                    emailIdx = i;
                } else if (header.contains("groupe") || header.contains("group")) {
                    groupIdx = i;
                }
            }

            if (fullNameIdx == -1) {
                throw new IllegalArgumentException("Colonne 'Nom Complet' non trouvée.");
            }

            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().isEmpty()) continue;

                List<String> columns = new ArrayList<>();
                boolean inQuotes = false;
                StringBuilder sb = new StringBuilder();
                for (int c = 0; c < line.length(); c++) {
                    char ch = line.charAt(c);
                    if (ch == '"') {
                        inQuotes = !inQuotes;
                    } else if (String.valueOf(ch).equals(sep) && !inQuotes) {
                        columns.add(sb.toString().trim());
                        sb.setLength(0);
                    } else {
                        sb.append(ch);
                    }
                }
                columns.add(sb.toString().trim());

                if (fullNameIdx >= columns.size()) continue;
                String fullName = columns.get(fullNameIdx).replace("\"", "");
                if (fullName.isEmpty() || fullName.contains("(Exemple)") || fullName.contains("(Example)")) {
                    continue;
                }

                String phone = (phoneIdx != -1 && phoneIdx < columns.size()) ? columns.get(phoneIdx).replace("\"", "") : "";
                String email = (emailIdx != -1 && emailIdx < columns.size()) ? columns.get(emailIdx).replace("\"", "") : "";
                String group = (groupIdx != -1 && groupIdx < columns.size()) ? columns.get(groupIdx).replace("\"", "") : "";

                GuestDTO guest = new GuestDTO();
                guest.setFullName(fullName);
                guest.setPhone(phone);
                guest.setEmail(email);
                guest.setGroupName(group);
                guest.setStatus(GuestStatus.PENDING);
                list.add(guest);
            }
        }
        return list;
    }
}
