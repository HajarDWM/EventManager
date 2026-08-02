package com.example.eventmanager.domain.model;

public enum InvoiceStatus {
    UNPAID,         // Impayée
    PARTIALLY_PAID, // Payée partiellement (acompte reçu)
    PAID,           // Payée en totalité
    CANCELLED       // Annulée
}
