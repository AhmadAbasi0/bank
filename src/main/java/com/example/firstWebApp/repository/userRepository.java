package com.example.firstWebApp.repository;

import com.example.firstWebApp.entities.user;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface userRepository extends JpaRepository<user,Long> {
    user findByUsername(String username);
}
