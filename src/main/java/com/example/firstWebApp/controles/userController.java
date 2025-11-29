package com.example.firstWebApp.controles;
import com.example.firstWebApp.services.userServices;
import com.example.firstWebApp.entities.user;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Optional;

@RestController
public class userController {

    @Autowired
    private userServices userServices;
    
    @PostMapping("/users/addUser")
    public @ResponseBody user addUser(@RequestBody user u)
    {
        return userServices.addUser(u);
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
    
    @GetMapping("/user/findByUsername/{username}")
    public @ResponseBody user findByUsername(@PathVariable String username)
    {
        return userServices.findByUsername(username);
    }
    
    @PutMapping("/user/updateGender/{username}")
    public @ResponseBody user updateGender(@PathVariable String username, @RequestBody java.util.Map<String, String> request)
    {
        String gender = request.get("gender");
        return userServices.updateUserGender(username, gender);
    }
}
