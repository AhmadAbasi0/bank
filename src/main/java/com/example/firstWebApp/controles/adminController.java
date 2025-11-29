package com.example.firstWebApp.controles;

import com.example.firstWebApp.services.adminServices;
import com.example.firstWebApp.entities.user;
import com.example.firstWebApp.entities.account;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class adminController {

    @Autowired
    private adminServices adminServices;

    @GetMapping("/check/{accountId}")
    public @ResponseBody ResponseEntity<Map<String, Boolean>> checkAdmin(@PathVariable Long accountId) {
        boolean isAdmin = adminServices.isAdmin(accountId);
        return ResponseEntity.ok(Map.of("isAdmin", isAdmin));
    }

    @GetMapping("/users/all")
    public @ResponseBody ResponseEntity<ArrayList<user>> getAllUsers(@RequestParam Long accountId) {
        if (!adminServices.isAdmin(accountId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
        return ResponseEntity.ok(adminServices.getAllUsers());
    }

    @GetMapping("/accounts/all")
    public @ResponseBody ResponseEntity<ArrayList<account>> getAllAccounts(@RequestParam Long accountId) {
        if (!adminServices.isAdmin(accountId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }
        return ResponseEntity.ok(adminServices.getAllAccounts());
    }

    @PutMapping("/users/update/{userId}")
    public @ResponseBody ResponseEntity<?> updateUser(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> updates,
            @RequestParam Long accountId) {
        if (!adminServices.isAdmin(accountId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied"));
        }
        try {
            user updatedUser = adminServices.updateUser(userId, updates);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/accounts/update/{accountId}")
    public @ResponseBody ResponseEntity<?> updateAccount(
            @PathVariable Long accountId,
            @RequestBody Map<String, Object> updates,
            @RequestParam Long adminAccountId) {
        if (!adminServices.isAdmin(adminAccountId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Access denied"));
        }
        try {
            account updatedAccount = adminServices.updateAccount(accountId, updates);
            return ResponseEntity.ok(updatedAccount);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", e.getMessage()));
        }
    }
}

