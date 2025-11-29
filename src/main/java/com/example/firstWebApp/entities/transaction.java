package com.example.firstWebApp.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "sender_account_id")
    private Long senderAccountId;

    @Column(name = "receiver_account_id")
    private Long receiverAccountId;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "transaction_type")
    private String transactionType; // "TRANSFER", "DEPOSIT", "WITHDRAWAL"

    @Column(name = "description")
    private String description;

    @Column(name = "transaction_date")
    private LocalDateTime transactionDate;

    @Column(name = "status")
    private String status; // "SUCCESS", "PENDING", "FAILED"

    @Column(name = "reference_number", unique = true)
    private String referenceNumber;

    // Constructors
    public transaction() {}

    public transaction(Long senderAccountId, Long receiverAccountId, Double amount,
                       String transactionType, String description, String status) {
        this.senderAccountId = senderAccountId;
        this.receiverAccountId = receiverAccountId;
        this.amount = amount;
        this.transactionType = transactionType;
        this.description = description;
        this.transactionDate = LocalDateTime.now();
        this.status = status;
        this.referenceNumber = generateReferenceNumber();
    }

    // Generate unique reference number
    private String generateReferenceNumber() {
        return "TXN" + System.currentTimeMillis();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSenderAccountId() { return senderAccountId; }
    public void setSenderAccountId(Long senderAccountId) { this.senderAccountId = senderAccountId; }

    public Long getReceiverAccountId() { return receiverAccountId; }
    public void setReceiverAccountId(Long receiverAccountId) { this.receiverAccountId = receiverAccountId; }

    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }

    public String getTransactionType() { return transactionType; }
    public void setTransactionType(String transactionType) { this.transactionType = transactionType; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getTransactionDate() { return transactionDate; }
    public void setTransactionDate(LocalDateTime transactionDate) { this.transactionDate = transactionDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReferenceNumber() { return referenceNumber; }
    public void setReferenceNumber(String referenceNumber) { this.referenceNumber = referenceNumber; }
}
