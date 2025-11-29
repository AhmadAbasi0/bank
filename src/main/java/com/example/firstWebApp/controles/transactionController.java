package com.example.firstWebApp.controles;

import com.example.firstWebApp.services.transactionServices;
import com.example.firstWebApp.entities.transaction;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/transactions")
public class transactionController {

    @Autowired
    private transactionServices transactionServices;

    @PostMapping("/send")
    public ResponseEntity<?> sendMoney(@RequestBody Map<String, Object> request) {
        try {
            Long senderAccountId = Long.valueOf(request.get("senderAccountId").toString());
            Long receiverAccountId = Long.valueOf(request.get("receiverAccountId").toString());
            Double amount = Double.valueOf(request.get("amount").toString());
            String description = request.containsKey("description") ? request.get("description").toString() : null;

            transaction transaction = transactionServices.sendMoney(senderAccountId, receiverAccountId, amount, description);
            
            if ("FAILED".equals(transaction.getStatus())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Insufficient balance", "transaction", transaction));
            }
            
            return ResponseEntity.ok(transaction);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Transaction failed: " + e.getMessage()));
        }
    }

    @GetMapping("/account/{accountId}")
    public ResponseEntity<List<transaction>> getTransactionsByAccount(@PathVariable Long accountId) {
        List<transaction> transactions = transactionServices.getTransactionsByAccountId(accountId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTransactionById(@PathVariable Long id) {
        Optional<transaction> transaction = transactionServices.getTransactionById(id);
        if (transaction.isPresent()) {
            return ResponseEntity.ok(transaction.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.of("error", "Transaction not found"));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<?> getAllTransactions(@RequestParam Long adminAccountId) {
        // Verify admin (account id = 1)
        if (adminAccountId == null || adminAccountId != 1) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", "Access denied. Admin privileges required."));
        }
        List<transaction> transactions = transactionServices.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    @DeleteMapping("/admin/delete/{transactionId}")
    public ResponseEntity<?> deleteTransaction(
            @PathVariable Long transactionId,
            @RequestParam Long adminAccountId) {
        try {
            transactionServices.deleteTransaction(transactionId, adminAccountId);
            return ResponseEntity.ok(Map.of("message", "Transaction deleted and reversed successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete transaction: " + e.getMessage()));
        }
    }
}
