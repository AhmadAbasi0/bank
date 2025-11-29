package com.example.firstWebApp.services;

import com.example.firstWebApp.entities.account;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.firstWebApp.repository.accountRepository;

import java.util.ArrayList;
import java.util.Optional;

@Service
public class accountServices {
    @Autowired
    private accountRepository repository;

    public account addAccount(account r)
    {
        return repository.save(r);
    }
    public ArrayList<account> getAll()
    {
        return (ArrayList<account>) repository.findAll();
    }
    public Optional<account> findAccountById(Long id)
    {
        return repository.findById(id);
    }


}
