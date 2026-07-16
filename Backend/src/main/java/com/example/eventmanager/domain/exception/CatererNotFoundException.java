package com.example.eventmanager.domain.exception;

public class CatererNotFoundException extends RuntimeException {
    public CatererNotFoundException(Long id) {
        super("Traiteur introuvable avec l'ID : " + id);
    }
    
    public CatererNotFoundException(String email) {
        super("Traiteur introuvable avec l'email : " + email);
    }
}
