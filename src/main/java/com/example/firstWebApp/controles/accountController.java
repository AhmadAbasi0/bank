package com.example.firstWebApp.controles;

import com.example.firstWebApp.services.accountServices;
import com.example.firstWebApp.entities.account;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Optional;

import org.springframework.web.bind.annotation.RestController;

@RestController
public class accountController {

    @Autowired
    private accountServices accountServices;
    @PostMapping("/accounts/addAccount")
    public @ResponseBody account addaccount(@RequestBody account r) {return accountServices.addAccount(r);}

    @GetMapping("/accounts/getAll")
    public @ResponseBody ArrayList<account> getAll()
    {
        return accountServices.getAll();
    }

    @GetMapping("/account/findAccountId/{id}")
    public @ResponseBody Optional<account> findAccountById(@PathVariable Long id)
    {
        return accountServices.findAccountById(id);
    }



}
