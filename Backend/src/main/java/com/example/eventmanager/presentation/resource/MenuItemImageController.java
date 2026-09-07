package com.example.eventmanager.presentation.resource;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu-items")
@RequiredArgsConstructor
public class MenuItemImageController {

    @Value("${app.upload.menu-images-dir:src/main/resources/static/uploads/menu}")
    private String uploadDir;

    private static final long MAX_SIZE_BYTES = 2L * 1024 * 1024; // 2 MB
    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp"
    );

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Aucun fichier selectionne."));
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Type de fichier non autorise. Formats acceptes : JPG, PNG, WebP."
            ));
        }

        if (file.getSize() > MAX_SIZE_BYTES) {
            return ResponseEntity.badRequest().body(Map.of(
                "error", "Fichier trop volumineux. Taille maximum : 2 MB."
            ));
        }

        try {
            Path dirPath = Paths.get(uploadDir);
            Files.createDirectories(dirPath);

            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf("."))
                    : ".jpg";
            String newFilename = "dish_" + UUID.randomUUID().toString().replace("-", "") + extension;

            Path filePath = dirPath.resolve(newFilename);
            file.transferTo(filePath.toFile());

            String publicUrl = "/uploads/menu/" + newFilename;
            return ResponseEntity.ok(Map.of("url", publicUrl, "filename", newFilename));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of(
                "error", "Erreur lors de la sauvegarde du fichier : " + e.getMessage()
            ));
        }
    }
}
