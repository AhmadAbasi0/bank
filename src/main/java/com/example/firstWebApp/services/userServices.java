package com.example.firstWebApp.services;

import com.example.firstWebApp.entities.user;
import com.example.firstWebApp.entities.account;
import com.example.firstWebApp.repository.userRepository;
import com.example.firstWebApp.repository.accountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class userServices {
    @Autowired
    private userRepository repository;
    
    @Autowired
    private accountRepository accountRepository;

    @Transactional
    public user addUser(user u)
    {
        // Create account for the new user
        account newAccount = new account();
        newAccount.setAccountName(u.getUsername());
        newAccount.setBalance(0.0);
        newAccount.setPoints(0);
        newAccount.setDeptSum(0);
        
        // Save account first
        account savedAccount = accountRepository.save(newAccount);
        
        // Link account to user
        u.setAccount(savedAccount);
        
        // Save user
        return repository.save(u);
    }
    
    public ArrayList<user> getAll()
    {
        return (ArrayList<user>) repository.findAll();
    }
    
    public Optional<user> findUserById(Long id)
    {
        return repository.findById(id);
    }
    
    public user findByUsername(String username)
    {
        user foundUser = repository.findByUsername(username);
        // Ensure account is loaded
        if (foundUser != null && foundUser.getAccount() != null) {
            // Force account to be loaded by accessing it
            foundUser.getAccount().getId();
        }
        return foundUser;
    }
    
    @Transactional
    public user updateUserGender(String username, String gender)
    {
        user foundUser = repository.findByUsername(username);
        if (foundUser != null) {
            foundUser.setGender(gender);
            return repository.save(foundUser);
        }
        return null;
    }

  /*  public user updateUserInfo(user u,Long id)
    {
        Optional<user> u1 = repository.findById(id);
        u1.get().setAddress(u.getAddress());
        u1.get().setFirstName(u.getFirstName());
        u1.get().setEmail(u.getEmail());
        u1.get().setSecondName(u.getSecondName());
        u1.get().setPhoneNumber(u.getPhoneNumber());
        return repository.save(u1);
    }*/
}
