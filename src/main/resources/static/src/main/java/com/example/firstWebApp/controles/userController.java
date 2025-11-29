package com.example.firstWebApp.controles;
import com.example.firstWebApp.services.userServices;
import com.example.firstWebApp.entities.user;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;

@RestController
public class userController {

    @Autowired
    private userServices userServices;
    @PostMapping("/users/addUser")
    public ResponseEntity<?> addUser(@RequestBody user u)
    {
        try {
            user created = userServices.addUser(u);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Username already exists. Please choose another."));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Unable to create account at this time."));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (username == null || username.isBlank() || password == null || password.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Username and password are required."));
        }

        return userServices.authenticate(username.trim(), password)
                .map(authenticatedUser -> ResponseEntity.ok().body(authenticatedUser))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid username or password.")));
    }

    @GetMapping("/users/getAll")
    public @ResponseBody ArrayList<user> getAll()
    {
        return userServices.getAll();
    }

    @GetMapping("/user/findUserId/{id}")
    public @ResponseBody Optional<user> findUserById(@PathVariable Long id)
    {
        return userServices.findUserById(id);
    }
}
