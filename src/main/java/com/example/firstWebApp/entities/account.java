package com.example.firstWebApp.entities;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
@Entity
@Table(name = "accounts")
public class account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long  id;
    private int points = 0 ;
    private double balance = 0;
    private String accountName;
    private int deptSum;
    @OneToOne(mappedBy="account")
    @JsonIgnore
    private user user;

    public int deptSum() {
        return deptSum;
    }

    public account setDeptSum(int deptSum) {
        this.deptSum=deptSum;
        return this;
    }

    public String accountName() {
        return accountName;
    }

    public account setAccountName(String accountName) {
        this.accountName = accountName;
        return this;
    }
    
    public String getAccountName() {
        return accountName;
    }

    public int getDeptSum() {
        return deptSum;
    }
    
    public double getBalance() {
        return balance;
    }
    
    public int getPoints() {
        return points;
    }

    public double balance() {
        return balance;
    }

    public account setBalance(double balance) {
        this.balance=balance;
        return this;
    }

    public Long id() {
        return id;
    }
    
    public Long getId() {
        return id;
    }

    public account setId(Long id) {
        this.id=id;
        return this;
    }


    public int points() {
        return points;
    }

    public account setPoints(int points) {
        this.points=points;
        return this;
    }

    public user user() {
        return user;
    }

    public account setUser(user user) {
        this.user=user;
        return this;
    }
}
