package com.example.firstWebApp.services;

import com.example.firstWebApp.entities.transaction;
import com.example.firstWebApp.entities.account;
import com.example.firstWebApp.repository.transactionRepository;
import com.example.firstWebApp.repository.accountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class transactionServices {

    @Autowired
    private transactionRepository transactionRepository;

    @Autowired
    private accountRepository accountRepository;

    @Transactional
    public transaction sendMoney(Long senderAccountId, Long receiverAccountId, Double amount, String description) {
        // Validate amount
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Amount must be greater than 0");
        }

        // Get sender account
        Optional<account> senderOpt = accountRepository.findById(senderAccountId);
        if (senderOpt.isEmpty()) {
            throw new IllegalArgumentException("Sender account not found");
        }
        account senderAccount = senderOpt.get();

        // Get receiver account
        Optional<account> receiverOpt = accountRepository.findById(receiverAccountId);
        if (receiverOpt.isEmpty()) {
            throw new IllegalArgumentException("Receiver account not found");
        }
        account receiverAccount = receiverOpt.get();

        // Check if sender has enough balance
        if (senderAccount.getBalance() < amount) {
            // Create failed transaction record
            transaction failedTransaction = new transaction();
            failedTransaction.setSenderAccountId(senderAccountId);
            failedTransaction.setReceiverAccountId(receiverAccountId);
            failedTransaction.setAmount(amount);
            failedTransaction.setTransactionType("TRANSFER");
            failedTransaction.setDescription(description != null ? description : "Money transfer");
            failedTransaction.setTransactionDate(LocalDateTime.now());
            failedTransaction.setStatus("FAILED");
            failedTransaction.setReferenceNumber("TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8));
            return transactionRepository.save(failedTransaction);
        }

        // Perform transaction
        senderAccount.setBalance(senderAccount.getBalance() - amount);
        receiverAccount.setBalance(receiverAccount.getBalance() + amount);

        // Save accounts
        accountRepository.save(senderAccount);
        accountRepository.save(receiverAccount);

        // Create transaction record
        transaction transaction = new transaction();
        transaction.setSenderAccountId(senderAccountId);
        transaction.setReceiverAccountId(receiverAccountId);
        transaction.setAmount(amount);
        transaction.setTransactionType("TRANSFER");
        transaction.setDescription(description != null ? description : "Money transfer");
        transaction.setTransactionDate(LocalDateTime.now());
        transaction.setStatus("SUCCESS");
        transaction.setReferenceNumber("TXN" + System.currentTimeMillis() + UUID.randomUUID().toString().substring(0, 8));

        return transactionRepository.save(transaction);
    }

    public List<transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public List<transaction> getTransactionsByAccountId(Long accountId) {
        return transactionRepository.findBySenderAccountIdOrReceiverAccountId(accountId, accountId);
    }

    public Optional<transaction> getTransactionById(Long id) {
        return transactionRepository.findById(id);
    }

    @Transactional
    public void deleteTransaction(Long transactionId, Long adminAccountId) {
        // Verify admin (account id = 1)
        if (adminAccountId == null || adminAccountId != 1) {
            throw new IllegalArgumentException("Only admin can delete transactions");
        }

        Optional<transaction> transactionOpt = transactionRepository.findById(transactionId);
        if (transactionOpt.isEmpty()) {
            throw new IllegalArgumentException("Transaction not found");
        }

        transaction transaction = transactionOpt.get();

        // Only reverse successful transactions
        if (!"SUCCESS".equals(transaction.getStatus())) {
            throw new IllegalArgumentException("Can only reverse successful transactions");
        }

        // Reverse the transaction
        Optional<account> senderOpt = accountRepository.findById(transaction.getSenderAccountId());
        Optional<account> receiverOpt = accountRepository.findById(transaction.getReceiverAccountId());

        if (senderOpt.isPresent() && receiverOpt.isPresent()) {
            account senderAccount = senderOpt.get();
            account receiverAccount = receiverOpt.get();

            // Return money to sender
            senderAccount.setBalance(senderAccount.getBalance() + transaction.getAmount());
            // Remove money from receiver
            receiverAccount.setBalance(receiverAccount.getBalance() - transaction.getAmount());

            // Save accounts
            accountRepository.save(senderAccount);
            accountRepository.save(receiverAccount);
        }

        // Delete the transaction
        transactionRepository.delete(transaction);
    }
}
