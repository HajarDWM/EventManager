package com.example.eventmanager.application.port.in;

import java.math.BigDecimal;

public interface RecordTransactionUseCase {
    void recordTransaction(Long catererId, String plan, BigDecimal amountPaid, BigDecimal vatRate, String paymentStatus);
}
