package com.example.eventmanager.domain.model;

public enum QuoteStatus {
    DRAFT,      // Brouillon
    SENT,       // Envoyé au client
    ACCEPTED,   // Accepté / Signé
    REJECTED,   // Refusé
    INVOICED    // Facturé (transformé en facture)
}
