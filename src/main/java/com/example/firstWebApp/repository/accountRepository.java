package com.example.firstWebApp.repository;

import com.example.firstWebApp.entities.account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface accountRepository extends JpaRepository<account,Long> {
}
