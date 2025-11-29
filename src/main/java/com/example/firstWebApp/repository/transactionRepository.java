package com.example.firstWebApp.repository;

import com.example.firstWebApp.entities.transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface transactionRepository extends JpaRepository<transaction, Long> {

    // Find all transactions for a specific account (as sender or receiver)
    List<transaction> findBySenderAccountIdOrReceiverAccountId(Long senderAccountId, Long receiverAccountId);

    // Find all transactions sent by an account
    List<transaction> findBySenderAccountId(Long senderAccountId);

    // Find all transactions received by an account
    List<transaction> findByReceiverAccountId(Long receiverAccountId);

    // Find transaction by reference number
    Optional<transaction> findByReferenceNumber(String referenceNumber);
}
