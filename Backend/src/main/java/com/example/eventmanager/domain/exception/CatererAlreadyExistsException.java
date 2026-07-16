package com.example.eventmanager.domain.exception;

public class CatererAlreadyExistsException extends RuntimeException {
    public CatererAlreadyExistsException(String email) {
        super("Un traiteur avec l'email " + email + " existe déjà.");
    }
}
