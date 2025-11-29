package com.example.firstWebApp.services;

import com.example.firstWebApp.entities.loan;
import com.example.firstWebApp.entities.user;
import com.example.firstWebApp.entities.account;
import com.example.firstWebApp.repository.loanRepository;
import com.example.firstWebApp.repository.userRepository;
import com.example.firstWebApp.repository.accountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class loanServices {

    @Autowired
    private loanRepository loanRepository;
    
    @Autowired
    private userRepository userRepository;
    
    @Autowired
    private accountRepository accountRepository;

    /**
     * Calculate interest (30% of amount)
     */
    private Double calculateInterest(Double amount) {
        if (amount == null || amount <= 0) {
            return 0.0;
        }
        return amount * 0.30;
    }

    /**
     * Calculate return amount (amount + interest)
     */
    private Double calculateReturnAmount(Double amount, Double interest) {
        if (amount == null || interest == null) {
            return 0.0;
        }
        return amount + interest;
    }

    /**
     * Apply for a new loan
     * @param userId - User applying for the loan
     * @param reason - Reason for the loan
     * @param amount - Loan amount requested
     * @return Created loan object
     */
    @Transactional
    public loan applyForLoan(Long userId, String reason, Double amount) {

        // Validate inputs
        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Invalid user ID");
        }

        if (reason == null || reason.trim().isEmpty()) {
            throw new IllegalArgumentException("Reason is required");
        }

        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Loan amount must be greater than 0");
        }

        // Check if user exists and has at least 250 points
        Optional<user> userOpt = userRepository.findById(userId);
        if (!userOpt.isPresent()) {
            throw new IllegalArgumentException("User not found");
        }

        user applicant = userOpt.get();
        if (applicant.getAccount() == null) {
            throw new IllegalArgumentException("User account not found");
        }

        int userPoints = applicant.getAccount().getPoints();
        if (userPoints < 250) {
            throw new IllegalArgumentException("Sorry, you must have 250 points or more to apply for a loan");
        }

        // Create new loan
        loan newLoan = new loan(userId, reason, amount);
        return loanRepository.save(newLoan);
    }

    /**
     * Approve a loan application
     * @param loanId - ID of the loan to approve
     * @return Updated loan object
     */
    @Transactional
    public loan approveLoan(Long loanId) {
        Optional<loan> loanOpt = loanRepository.findById(loanId);

        if (!loanOpt.isPresent()) {
            throw new IllegalArgumentException("Loan not found");
        }

        loan loanToApprove = loanOpt.get();

        if (loanToApprove.getIsApproved()) {
            throw new IllegalArgumentException("Loan is already approved");
        }

        // Get the user and their account
        Optional<user> userOpt = userRepository.findById(loanToApprove.getUserId());
        if (!userOpt.isPresent()) {
            throw new IllegalArgumentException("User not found for this loan");
        }

        user loanUser = userOpt.get();
        if (loanUser.getAccount() == null) {
            throw new IllegalArgumentException("User account not found");
        }

        account userAccount = loanUser.getAccount();
        
        // Increase the debt by the returnAmount
        Double returnAmount = loanToApprove.getReturnAmount();
        if (returnAmount == null) {
            returnAmount = loanToApprove.getAmount() + loanToApprove.getInterest();
        }
        
        int currentDebt = userAccount.getDeptSum();
        // Round the returnAmount to the nearest integer before adding to debt
        int debtIncrease = (int) Math.round(returnAmount);
        int newDebt = currentDebt + debtIncrease;
        userAccount.setDeptSum(newDebt);
        
        // Save the updated account
        accountRepository.save(userAccount);

        // Approve the loan
        loanToApprove.setIsApproved(true);
        loanToApprove.setStatus("APPROVED");
        loanToApprove.setApprovalDate(LocalDateTime.now());

        return loanRepository.save(loanToApprove);
    }

    /**
     * Reject a loan application
     * @param loanId - ID of the loan to reject
     * @return Updated loan object
     */
    @Transactional
    public loan rejectLoan(Long loanId) {
        Optional<loan> loanOpt = loanRepository.findById(loanId);

        if (!loanOpt.isPresent()) {
            throw new IllegalArgumentException("Loan not found");
        }

        loan loanToReject = loanOpt.get();

        if (loanToReject.getIsApproved()) {
            throw new IllegalArgumentException("Cannot reject an already approved loan");
        }

        loanToReject.setIsApproved(false);
        loanToReject.setStatus("REJECTED");

        return loanRepository.save(loanToReject);
    }

    /**
     * Disburse a loan (mark as disbursed)
     * @param loanId - ID of the loan to disburse
     * @return Updated loan object
     */
    @Transactional
    public loan disburseLoan(Long loanId) {
        Optional<loan> loanOpt = loanRepository.findById(loanId);

        if (!loanOpt.isPresent()) {
            throw new IllegalArgumentException("Loan not found");
        }

        loan loanToDisbursee = loanOpt.get();

        if (!loanToDisbursee.getIsApproved()) {
            throw new IllegalArgumentException("Cannot disburse a non-approved loan");
        }

        loanToDisbursee.setStatus("DISBURSED");

        return loanRepository.save(loanToDisbursee);
    }

    /**
     * Get all loans for a user
     */
    public ArrayList<loan> getUserLoans(Long userId) {
        List<loan> loans = loanRepository.findByUserId(userId);
        return new ArrayList<>(loans);
    }

    /**
     * Get approved loans for a user
     */
    public ArrayList<loan> getUserApprovedLoans(Long userId) {
        List<loan> loans = loanRepository.findByUserIdAndIsApproved(userId, true);
        return new ArrayList<>(loans);
    }

    /**
     * Get pending loans for a user
     */
    public ArrayList<loan> getUserPendingLoans(Long userId) {
        List<loan> loans = loanRepository.findByUserIdAndIsApproved(userId, false);
        return new ArrayList<>(loans);
    }

    /**
     * Get all loans with a specific status
     */
    public ArrayList<loan> getLoansByStatus(String status) {
        List<loan> loans = loanRepository.findByStatus(status);
        return new ArrayList<>(loans);
    }

    /**
     * Get all pending loans (admin view)
     */
    public ArrayList<loan> getAllPendingLoans() {
        return getLoansByStatus("PENDING");
    }

    /**
     * Get all approved loans (admin view)
     */
    public ArrayList<loan> getAllApprovedLoans() {
        List<loan> loans = loanRepository.findByIsApproved(true);
        return new ArrayList<>(loans);
    }

    /**
     * Get loan by ID
     */
    public Optional<loan> getLoanById(Long loanId) {
        return loanRepository.findById(loanId);
    }

    /**
     * Get loan by loan number
     */
    public Optional<loan> getLoanByNumber(String loanNumber) {
        return loanRepository.findByLoanNumber(loanNumber);
    }

    /**
     * Get all loans
     */
    public ArrayList<loan> getAllLoans() {
        return (ArrayList<loan>) loanRepository.findAll();
    }

    /**
     * Count total loans for a user
     */
    public long countUserLoans(Long userId) {
        return loanRepository.countByUserId(userId);
    }

    /**
     * Count approved loans for a user
     */
    public long countUserApprovedLoans(Long userId) {
        return loanRepository.countByUserIdAndIsApproved(userId, true);
    }

    /**
     * Delete a loan
     */
    public void deleteLoan(Long loanId) {
        loanRepository.deleteById(loanId);
    }

    /**
     * Update loan reason
     */
    @Transactional
    public loan updateLoanReason(Long loanId, String newReason) {
        Optional<loan> loanOpt = loanRepository.findById(loanId);

        if (!loanOpt.isPresent()) {
            throw new IllegalArgumentException("Loan not found");
        }

        loan loanToUpdate = loanOpt.get();

        if (loanToUpdate.getIsApproved()) {
            throw new IllegalArgumentException("Cannot update an approved loan");
        }

        loanToUpdate.setReason(newReason);
        return loanRepository.save(loanToUpdate);
    }

    /**
     * Update loan amount (interest and returnAmount are automatically recalculated)
     */
    @Transactional
    public loan updateLoanAmount(Long loanId, Double newAmount) {
        Optional<loan> loanOpt = loanRepository.findById(loanId);

        if (!loanOpt.isPresent()) {
            throw new IllegalArgumentException("Loan not found");
        }

        loan loanToUpdate = loanOpt.get();

        if (loanToUpdate.getIsApproved()) {
            throw new IllegalArgumentException("Cannot update an approved loan");
        }

        if (newAmount == null || newAmount <= 0) {
            throw new IllegalArgumentException("Loan amount must be greater than 0");
        }

        loanToUpdate.setAmount(newAmount);
        // interest and returnAmount are automatically calculated when amount is set

        return loanRepository.save(loanToUpdate);
    }

    /**
     * Get total interest for all loans of a user
     */
    public Double getUserTotalInterest(Long userId) {
        ArrayList<loan> userLoans = getUserLoans(userId);
        return userLoans.stream()
                .mapToDouble(l -> l.getInterest() != null ? l.getInterest() : 0.0)
                .sum();
    }

    /**
     * Get total interest for approved loans only
     */
    public Double getUserApprovedLoansInterest(Long userId) {
        ArrayList<loan> approvedLoans = getUserApprovedLoans(userId);
        return approvedLoans.stream()
                .mapToDouble(l -> l.getInterest() != null ? l.getInterest() : 0.0)
                .sum();
    }

    /**
     * Get total return amount for a user (sum of all return amounts)
     */
    public Double getUserTotalReturnAmount(Long userId) {
        ArrayList<loan> userLoans = getUserLoans(userId);
        return userLoans.stream()
                .mapToDouble(l -> l.getReturnAmount() != null ? l.getReturnAmount() : 0.0)
                .sum();
    }

    /**
     * Get total return amount for approved loans only
     */
    public Double getUserApprovedLoansReturnAmount(Long userId) {
        ArrayList<loan> approvedLoans = getUserApprovedLoans(userId);
        return approvedLoans.stream()
                .mapToDouble(l -> l.getReturnAmount() != null ? l.getReturnAmount() : 0.0)
                .sum();
    }

    /**
     * Get total loan amount for a user
     */
    public Double getUserTotalLoanAmount(Long userId) {
        ArrayList<loan> userLoans = getUserLoans(userId);
        return userLoans.stream()
                .mapToDouble(l -> l.getAmount() != null ? l.getAmount() : 0.0)
                .sum();
    }

    /**
     * Get total loan amount for approved loans only
     */
    public Double getUserApprovedLoansAmount(Long userId) {
        ArrayList<loan> approvedLoans = getUserApprovedLoans(userId);
        return approvedLoans.stream()
                .mapToDouble(l -> l.getAmount() != null ? l.getAmount() : 0.0)
                .sum();
    }

    /**
     * Get loan summary for a user
     */
    public java.util.Map<String, Object> getUserLoanSummary(Long userId) {
        java.util.Map<String, Object> summary = new java.util.HashMap<>();
        summary.put("userId", userId);
        summary.put("totalLoans", countUserLoans(userId));
        summary.put("approvedLoans", countUserApprovedLoans(userId));
        summary.put("totalLoanAmount", getUserTotalLoanAmount(userId));
        summary.put("totalInterest", getUserTotalInterest(userId));
        summary.put("totalReturnAmount", getUserTotalReturnAmount(userId));
        summary.put("approvedLoanAmount", getUserApprovedLoansAmount(userId));
        summary.put("approvedInterest", getUserApprovedLoansInterest(userId));
        summary.put("approvedReturnAmount", getUserApprovedLoansReturnAmount(userId));
        return summary;
    }
}
