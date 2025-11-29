package com.example.firstWebApp.repository;

import com.example.firstWebApp.entities.loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface loanRepository extends JpaRepository<loan, Long> {

    // Find all loans for a specific user
    List<loan> findByUserId(Long userId);

    // Find approved loans for a user
    List<loan> findByUserIdAndIsApproved(Long userId, Boolean isApproved);

    // Find pending loans
    List<loan> findByStatus(String status);

    // Find loan by loan number
    Optional<loan> findByLoanNumber(String loanNumber);

    // Find all approved loans
    List<loan> findByIsApproved(Boolean isApproved);

    // Count loans for a user
    long countByUserId(Long userId);

    // Count approved loans for a user
    long countByUserIdAndIsApproved(Long userId, Boolean isApproved);
}
