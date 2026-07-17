package com.example.eventmanager.domain.exception;

public class EventNotFoundException extends RuntimeException {
    public EventNotFoundException(Long id) {
        super("Evénement introuvable avec l'ID: " + id);
    }
}
