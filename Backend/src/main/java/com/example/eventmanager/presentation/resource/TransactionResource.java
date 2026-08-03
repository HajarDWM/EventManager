package com.example.eventmanager.presentation.resource;

import com.example.eventmanager.application.dto.TransactionDTO;
import com.example.eventmanager.application.port.in.GetTransactionsUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/admin/transactions")
@RequiredArgsConstructor
public class TransactionResource {

    private final GetTransactionsUseCase getTransactionsUseCase;

    @GetMapping
    public ResponseEntity<Page<TransactionDTO>> getTransactions(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "paymentDate"));
        return ResponseEntity.ok(getTransactionsUseCase.getTransactions(search, pageable));
    }

    @GetMapping("/export/csv")
    public ResponseEntity<byte[]> exportCsv() {
        List<TransactionDTO> list = getTransactionsUseCase.getAllTransactionsForExport();
        StringBuilder csv = new StringBuilder();
        
        // UTF-8 BOM to ensure proper French character display in Excel
        csv.append("\uFEFF");
        csv.append("ID Transaction;Organisateur;Forfait;Montant Payé;TVA (%);Date;Statut\n");
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        for (TransactionDTO t : list) {
            csv.append(String.format("%s;%s;%s;%s;%s;%s;%s\n",
                t.getId(),
                t.getBusinessName().replace(";", ","),
                t.getSubscriptionPlan(),
                t.getAmountPaid().toString(),
                t.getVatRate().toString(),
                t.getPaymentDate().format(formatter),
                t.getPaymentStatus()
            ));
        }
        
        byte[] bytes = csv.toString().getBytes(StandardCharsets.UTF_8);
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv; charset=utf-8"));
        headers.setContentDisposition(ContentDisposition.attachment().filename("rapport_transactions.csv").build());
        
        return new ResponseEntity<>(bytes, headers, HttpStatus.OK);
    }
}
