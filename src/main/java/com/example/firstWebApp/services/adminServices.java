package com.example.firstWebApp.services;

import com.example.firstWebApp.entities.user;
import com.example.firstWebApp.entities.account;
import com.example.firstWebApp.repository.userRepository;
import com.example.firstWebApp.repository.accountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;

@Service
public class adminServices {

    @Autowired
    private userRepository userRepository;

    @Autowired
    private accountRepository accountRepository;

    public boolean isAdmin(Long accountId) {
        if (accountId == null) {
            return false;
        }
        // Admin is the account with id = 1
        return accountId == 1L;
    }

    public ArrayList<user> getAllUsers() {
        return (ArrayList<user>) userRepository.findAll();
    }

    public ArrayList<account> getAllAccounts() {
        return (ArrayList<account>) accountRepository.findAll();
    }

    @Transactional
    public user updateUser(Long userId, Map<String, Object> updates) {
        Optional<user> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found");
        }

        user user = userOpt.get();

        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String field = entry.getKey();
            Object value = entry.getValue();

            switch (field) {
                case "firstName":
                    if (value instanceof String) {
                        user.setFirstName((String) value);
                    } else {
                        throw new IllegalArgumentException("firstName must be a String");
                    }
                    break;
                case "secondName":
                    if (value instanceof String) {
                        user.setSecondName((String) value);
                    } else {
                        throw new IllegalArgumentException("secondName must be a String");
                    }
                    break;
                case "email":
                    if (value instanceof String) {
                        user.setEmail((String) value);
                    } else {
                        throw new IllegalArgumentException("email must be a String");
                    }
                    break;
                case "phoneNumber":
                    if (value instanceof String) {
                        user.setPhoneNumber((String) value);
                    } else {
                        throw new IllegalArgumentException("phoneNumber must be a String");
                    }
                    break;
                case "username":
                    if (value instanceof String) {
                        user.setUsername((String) value);
                    } else {
                        throw new IllegalArgumentException("username must be a String");
                    }
                    break;
                case "password":
                    if (value instanceof String) {
                        user.setPassword((String) value);
                    } else {
                        throw new IllegalArgumentException("password must be a String");
                    }
                    break;
                case "gender":
                    if (value instanceof String) {
                        user.setGender((String) value);
                    } else {
                        throw new IllegalArgumentException("gender must be a String");
                    }
                    break;
                case "id":
                    if (value instanceof Number) {
                        user.setId(((Number) value).longValue());
                    } else {
                        throw new IllegalArgumentException("id must be a Number");
                    }
                    break;
                default:
                    throw new IllegalArgumentException("Unknown field: " + field);
            }
        }

        return userRepository.save(user);
    }

    @Transactional
    public account updateAccount(Long accountId, Map<String, Object> updates) {
        Optional<account> accountOpt = accountRepository.findById(accountId);
        if (accountOpt.isEmpty()) {
            throw new IllegalArgumentException("Account not found");
        }

        account account = accountOpt.get();

        for (Map.Entry<String, Object> entry : updates.entrySet()) {
            String field = entry.getKey();
            Object value = entry.getValue();

            switch (field) {
                case "accountName":
                    if (value instanceof String) {
                        account.setAccountName((String) value);
                    } else {
                        throw new IllegalArgumentException("accountName must be a String");
                    }
                    break;
                case "balance":
                    if (value instanceof Number) {
                        account.setBalance(((Number) value).doubleValue());
                    } else {
                        throw new IllegalArgumentException("balance must be a Number");
                    }
                    break;
                case "points":
                    if (value instanceof Number) {
                        account.setPoints(((Number) value).intValue());
                    } else {
                        throw new IllegalArgumentException("points must be a Number");
                    }
                    break;
                case "deptSum":
                    if (value instanceof Number) {
                        account.setDeptSum(((Number) value).intValue());
                    } else {
                        throw new IllegalArgumentException("deptSum must be a Number");
                    }
                    break;
                case "id":
                    if (value instanceof Number) {
                        account.setId(((Number) value).longValue());
                    } else {
                        throw new IllegalArgumentException("id must be a Number");
                    }
                    break;
                default:
                    throw new IllegalArgumentException("Unknown field: " + field);
            }
        }

        return accountRepository.save(account);
    }
}

