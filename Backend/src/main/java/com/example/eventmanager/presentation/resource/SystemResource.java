package com.example.eventmanager.presentation.resource;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class SystemResource {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    public static final String APP_VERSION = "v1.2.0";

    @GetMapping({"/version", "/public/version"})
    public ResponseEntity<Map<String, Object>> getSystemVersion() {
        Map<String, Object> versionInfo = new HashMap<>();
        versionInfo.put("application", "EventManager");
        versionInfo.put("version", APP_VERSION);
        versionInfo.put("profile", activeProfile);
        versionInfo.put("status", "UP");
        versionInfo.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(versionInfo);
    }
}

