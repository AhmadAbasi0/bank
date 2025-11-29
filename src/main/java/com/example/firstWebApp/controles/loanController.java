package com.example.firstWebApp.controles;

import com.example.firstWebApp.entities.loan;
import com.example.firstWebApp.services.loanServices;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
public class loanController {

    @Autowired
    private loanServices loanServices;

    /**
     * Apply for a new loan
     * POST /loans/apply
     * Body: {
     *   "userId": 1,
     *   "reason": "Home renovation",
     *   "amount": 50000.00
     * }
     */
    @PostMapping("/loans/apply")
    public ResponseEntity<?> applyForLoan(@RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.parseLong(request.get("userId").toString());
            String reason = request.get("reason").toString();
            Double amount = Double.parseDouble(request.get("amount").toString());

            loan newLoan = loanServices.applyForLoan(userId, reason, amount);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Loan application submitted successfully");
            response.put("loan", newLoan);
            response.put("loanNumber", newLoan.getLoanNumber());
            response.put("amount", newLoan.getAmount());
            response.put("interest", newLoan.getInterest());
            response.put("returnAmount", newLoan.getReturnAmount());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to apply for loan: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Approve a loan application
     * POST /loans/approve/{loanId}
     */
    @PostMapping("/loans/approve/{loanId}")
    public ResponseEntity<?> approveLoan(@PathVariable Long loanId) {
        try {
            loan approvedLoan = loanServices.approveLoan(loanId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Loan approved successfully");
            response.put("loan", approvedLoan);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to approve loan: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Reject a loan application
     * POST /loans/reject/{loanId}
     */
    @PostMapping("/loans/reject/{loanId}")
    public ResponseEntity<?> rejectLoan(@PathVariable Long loanId) {
        try {
            loan rejectedLoan = loanServices.rejectLoan(loanId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Loan rejected successfully");
            response.put("loan", rejectedLoan);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to reject loan: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Disburse a loan
     * POST /loans/disburse/{loanId}
     */
    @PostMapping("/loans/disburse/{loanId}")
    public ResponseEntity<?> disburseLoan(@PathVariable Long loanId) {
        try {
            loan disbursedLoan = loanServices.disburseLoan(loanId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Loan disbursed successfully");
            response.put("loan", disbursedLoan);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to disburse loan: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get all loans for a user
     * GET /loans/user/{userId}
     */
    @GetMapping("/loans/user/{userId}")
    public ResponseEntity<?> getUserLoans(@PathVariable Long userId) {
        try {
            ArrayList<loan> loans = loanServices.getUserLoans(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("loans", loans);
            response.put("count", loans.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve user loans");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get approved loans for a user
     * GET /loans/user/{userId}/approved
     */
    @GetMapping("/loans/user/{userId}/approved")
    public ResponseEntity<?> getUserApprovedLoans(@PathVariable Long userId) {
        try {
            ArrayList<loan> loans = loanServices.getUserApprovedLoans(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("loans", loans);
            response.put("count", loans.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve approved loans");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get pending loans for a user
     * GET /loans/user/{userId}/pending
     */
    @GetMapping("/loans/user/{userId}/pending")
    public ResponseEntity<?> getUserPendingLoans(@PathVariable Long userId) {
        try {
            ArrayList<loan> loans = loanServices.getUserPendingLoans(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("loans", loans);
            response.put("count", loans.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve pending loans");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get all pending loans (Admin)
     * GET /loans/pending
     */
    @GetMapping("/loans/pending")
    public ResponseEntity<?> getAllPendingLoans() {
        try {
            ArrayList<loan> loans = loanServices.getAllPendingLoans();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("loans", loans);
            response.put("count", loans.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve pending loans");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get all approved loans (Admin)
     * GET /loans/approved
     */
    @GetMapping("/loans/approved")
    public ResponseEntity<?> getAllApprovedLoans() {
        try {
            ArrayList<loan> loans = loanServices.getAllApprovedLoans();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("loans", loans);
            response.put("count", loans.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve approved loans");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get loan by ID
     * GET /loans/{loanId}
     */
    @GetMapping("/loans/{loanId}")
    public ResponseEntity<?> getLoanById(@PathVariable Long loanId) {
        try {
            Optional<loan> loanOpt = loanServices.getLoanById(loanId);

            if (loanOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("loan", loanOpt.get());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Loan not found");
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve loan");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get loan by loan number
     * GET /loans/number/{loanNumber}
     */
    @GetMapping("/loans/number/{loanNumber}")
    public ResponseEntity<?> getLoanByNumber(@PathVariable String loanNumber) {
        try {
            Optional<loan> loanOpt = loanServices.getLoanByNumber(loanNumber);

            if (loanOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("loan", loanOpt.get());
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> response = new HashMap<>();
                response.put("success", false);
                response.put("message", "Loan not found");
                return ResponseEntity.notFound().build();
            }

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve loan");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get all loans (Admin)
     * GET /loans/getAll
     */
    @GetMapping("/loans/getAll")
    public ResponseEntity<?> getAllLoans() {
        try {
            ArrayList<loan> loans = loanServices.getAllLoans();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("loans", loans);
            response.put("count", loans.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve loans");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Delete a loan
     * DELETE /loans/delete/{loanId}
     */
    @DeleteMapping("/loans/delete/{loanId}")
    public ResponseEntity<?> deleteLoan(@PathVariable Long loanId) {
        try {
            loanServices.deleteLoan(loanId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Loan deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to delete loan");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Update loan reason
     * PUT /loans/update-reason/{loanId}
     * Body: { "reason": "New reason" }
     */
    @PutMapping("/loans/update-reason/{loanId}")
    public ResponseEntity<?> updateLoanReason(@PathVariable Long loanId, @RequestBody Map<String, Object> request) {
        try {
            String newReason = request.get("reason").toString();
            loan updatedLoan = loanServices.updateLoanReason(loanId, newReason);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Loan reason updated successfully");
            response.put("loan", updatedLoan);

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update loan reason");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Update loan amount (interest and returnAmount are automatically recalculated)
     * PUT /loans/update-amount/{loanId}
     * Body: { "amount": 60000.00 }
     */
    @PutMapping("/loans/update-amount/{loanId}")
    public ResponseEntity<?> updateLoanAmount(@PathVariable Long loanId, @RequestBody Map<String, Object> request) {
        try {
            Double newAmount = Double.parseDouble(request.get("amount").toString());
            loan updatedLoan = loanServices.updateLoanAmount(loanId, newAmount);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Loan amount updated successfully");
            response.put("loan", updatedLoan);
            response.put("amount", updatedLoan.getAmount());
            response.put("interest", updatedLoan.getInterest());
            response.put("returnAmount", updatedLoan.getReturnAmount());

            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to update loan amount");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get total interest for a user
     * GET /loans/user/{userId}/total-interest
     */
    @GetMapping("/loans/user/{userId}/total-interest")
    public ResponseEntity<?> getUserTotalInterest(@PathVariable Long userId) {
        try {
            Double totalInterest = loanServices.getUserTotalInterest(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("totalInterest", totalInterest);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to calculate total interest");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get total interest for approved loans only
     * GET /loans/user/{userId}/approved-interest
     */
    @GetMapping("/loans/user/{userId}/approved-interest")
    public ResponseEntity<?> getUserApprovedLoansInterest(@PathVariable Long userId) {
        try {
            Double approvedInterest = loanServices.getUserApprovedLoansInterest(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("approvedInterest", approvedInterest);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to calculate approved interest");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get total return amount for a user (sum of all return amounts)
     * GET /loans/user/{userId}/total-return
     */
    @GetMapping("/loans/user/{userId}/total-return")
    public ResponseEntity<?> getUserTotalReturnAmount(@PathVariable Long userId) {
        try {
            Double totalReturnAmount = loanServices.getUserTotalReturnAmount(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("totalReturnAmount", totalReturnAmount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to calculate total return amount");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get total return amount for approved loans only
     * GET /loans/user/{userId}/approved-return
     */
    @GetMapping("/loans/user/{userId}/approved-return")
    public ResponseEntity<?> getUserApprovedLoansReturnAmount(@PathVariable Long userId) {
        try {
            Double approvedReturnAmount = loanServices.getUserApprovedLoansReturnAmount(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("approvedReturnAmount", approvedReturnAmount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to calculate approved return amount");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get total loan amount for a user
     * GET /loans/user/{userId}/total-amount
     */
    @GetMapping("/loans/user/{userId}/total-amount")
    public ResponseEntity<?> getUserTotalLoanAmount(@PathVariable Long userId) {
        try {
            Double totalLoanAmount = loanServices.getUserTotalLoanAmount(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("totalLoanAmount", totalLoanAmount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to calculate total loan amount");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get total loan amount for approved loans only
     * GET /loans/user/{userId}/approved-amount
     */
    @GetMapping("/loans/user/{userId}/approved-amount")
    public ResponseEntity<?> getUserApprovedLoansAmount(@PathVariable Long userId) {
        try {
            Double approvedLoanAmount = loanServices.getUserApprovedLoansAmount(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("userId", userId);
            response.put("approvedLoanAmount", approvedLoanAmount);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to calculate approved loan amount");
            return ResponseEntity.internalServerError().body(response);
        }
    }

    /**
     * Get complete loan summary for a user
     * GET /loans/user/{userId}/summary
     */
    @GetMapping("/loans/user/{userId}/summary")
    public ResponseEntity<?> getUserLoanSummary(@PathVariable Long userId) {
        try {
            Map<String, Object> summary = loanServices.getUserLoanSummary(userId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("summary", summary);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to retrieve loan summary");
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
