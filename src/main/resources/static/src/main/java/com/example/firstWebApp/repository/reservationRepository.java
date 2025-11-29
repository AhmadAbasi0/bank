package com.example.firstWebApp.repository;

import com.example.firstWebApp.entities.reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface reservationRepository extends JpaRepository<reservation, Long> {
    List<reservation> findByUserId(Long userId);
    Optional<reservation> findByConsoleTypeAndReservationDateAndReservationTime(
            String consoleType, LocalDate reservationDate, LocalTime reservationTime);
}

