package com.example.firstWebApp.entities;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
@Table(name = "users")
public class user implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String firstName;
    private String secondName;
    private String email;
    private String phoneNumber;
    @Column(unique = true)
    private String username;
    private String password;
    private String gender;

    public String gender() {
        return gender;
    }


    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name ="account_id" ,referencedColumnName="id")
    private account account;

    public user() {

    }
    public void setGender(String gender) {
        this.gender=gender;
    }

    public String email() {
        return email;
    }

    public String firstName() {
        return firstName;
    }

    public Long id() {
        return id;
    }

    public String password() {
        return password;
    }

    public String phoneNumber() {
        return phoneNumber;
    }

    public account account() {
        return account;
    }
    
    public account getAccount() {
        return account;
    }

    public user setAccount(account account) {
        this.account=account;
        return this;
    }

    public String secondName() {
        return secondName;
    }

    public String username() {
        return username;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getSecondName() {
        return secondName;
    }

    public void setSecondName(String secondName) {
        this.secondName = secondName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getGender() {
        return gender;
    }

    }
