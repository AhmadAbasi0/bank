package com.example.firstWebApp.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loans")
public class loan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "reason")
    private String reason;

    @Column(name = "amount")
    private Double amount;

    @Column(name = "interest")
    private Double interest;

    @Column(name = "return_amount")
    private Double returnAmount;

    @Column(name = "application_date")
    private LocalDateTime applicationDate;

    @Column(name = "is_approved")
    private Boolean isApproved = false;

    @Column(name = "approval_date")
    private LocalDateTime approvalDate;

    @Column(name = "status")
    private String status; // "PENDING", "APPROVED", "REJECTED", "DISBURSED"

    @Column(name = "loan_number", unique = true)
    private String loanNumber;

    // Constructors
    public loan() {}

    public loan(Long userId, String reason, Double amount) {
        this.userId = userId;
        this.reason = reason;
        this.amount = amount;
        this.interest = calculateInterest(amount);
        this.returnAmount = calculateReturnAmount(amount, this.interest);
        this.applicationDate = LocalDateTime.now();
        this.isApproved = false;
        this.status = "PENDING";
        this.loanNumber = generateLoanNumber();
    }

    public loan(Long userId, String reason, Double amount, Boolean isApproved) {
        this.userId = userId;
        this.reason = reason;
        this.amount = amount;
        this.interest = calculateInterest(amount);
        this.returnAmount = calculateReturnAmount(amount, this.interest);
        this.applicationDate = LocalDateTime.now();
        this.isApproved = isApproved;
        this.status = isApproved ? "APPROVED" : "PENDING";
        this.loanNumber = generateLoanNumber();
    }

    // Calculate interest (30% of amount)
    private Double calculateInterest(Double amount) {
        if (amount == null) {
            return 0.0;
        }
        return amount * 0.30;
    }

    // Calculate return amount (amount + interest)
    private Double calculateReturnAmount(Double amount, Double interest) {
        if (amount == null || interest == null) {
            return 0.0;
        }
        return amount + interest;
    }

    // Generate unique loan number
    private String generateLoanNumber() {
        return "LOAN" + System.currentTimeMillis();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Double getAmount() {
        return amount;
    }

    public void setAmount(Double amount) {
        this.amount = amount;
        this.interest = calculateInterest(amount);
        this.returnAmount = calculateReturnAmount(amount, this.interest);
    }

    public Double getInterest() {
        return interest;
    }

    public void setInterest(Double interest) {
        this.interest = interest;
        this.returnAmount = calculateReturnAmount(this.amount, interest);
    }

    public Double getReturnAmount() {
        return returnAmount;
    }

    public void setReturnAmount(Double returnAmount) {
        this.returnAmount = returnAmount;
    }

    public LocalDateTime getApplicationDate() {
        return applicationDate;
    }

    public void setApplicationDate(LocalDateTime applicationDate) {
        this.applicationDate = applicationDate;
    }

    public Boolean getIsApproved() {
        return isApproved;
    }

    public void setIsApproved(Boolean isApproved) {
        this.isApproved = isApproved;
        if (isApproved) {
            this.status = "APPROVED";
            this.approvalDate = LocalDateTime.now();
        } else {
            this.status = "REJECTED";
        }
    }

    public LocalDateTime getApprovalDate() {
        return approvalDate;
    }

    public void setApprovalDate(LocalDateTime approvalDate) {
        this.approvalDate = approvalDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getLoanNumber() {
        return loanNumber;
    }

    public void setLoanNumber(String loanNumber) {
        this.loanNumber = loanNumber;
    }
}
