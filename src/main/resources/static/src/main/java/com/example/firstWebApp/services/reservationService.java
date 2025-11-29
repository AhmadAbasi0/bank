package com.example.firstWebApp.services;

import com.example.firstWebApp.entities.reservation;
import com.example.firstWebApp.repository.reservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class reservationService {
    @Autowired
    private reservationRepository repository;

    public reservation createReservation(reservation res) {
        // Check if the time slot is already taken
        Optional<reservation> existing = repository.findByConsoleTypeAndReservationDateAndReservationTime(
                res.getConsoleType(), res.getReservationDate(), res.getReservationTime());
        
        if (existing.isPresent()) {
            throw new IllegalArgumentException("This time slot is already reserved. Please try another time.");
        }
        
        return repository.save(res);
    }

    public List<reservation> getUserReservations(Long userId) {
        return repository.findByUserId(userId);
    }

    public ArrayList<reservation> getAllReservations() {
        return (ArrayList<reservation>) repository.findAll();
    }

    public boolean isTimeSlotAvailable(String consoleType, LocalDate date, LocalTime time) {
        Optional<reservation> existing = repository.findByConsoleTypeAndReservationDateAndReservationTime(
                consoleType, date, time);
        return existing.isEmpty();
    }
}

