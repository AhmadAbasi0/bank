package com.example.firstWebApp.controles;

import com.example.firstWebApp.entities.reservation;
import com.example.firstWebApp.services.reservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
public class reservationController {

    @Autowired
    private reservationService reservationService;

    @PostMapping("/reservations/create")
    public ResponseEntity<?> createReservation(@RequestBody Map<String, String> reservationData) {
        try {
            String consoleType = reservationData.get("consoleType");
            String dateStr = reservationData.get("reservationDate");
            String timeStr = reservationData.get("reservationTime");
            String durationStr = reservationData.get("durationMinutes");
            String userIdStr = reservationData.get("userId");

            if (consoleType == null || dateStr == null || timeStr == null || durationStr == null || userIdStr == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "All fields are required: consoleType, reservationDate, reservationTime, durationMinutes, userId"));
            }

            LocalDate reservationDate = LocalDate.parse(dateStr);
            LocalTime reservationTime = LocalTime.parse(timeStr);
            Integer durationMinutes = Integer.parseInt(durationStr);
            Long userId = Long.parseLong(userIdStr);

            if (durationMinutes <= 0) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("message", "Duration must be greater than 0"));
            }

            reservation res = new reservation(consoleType, reservationDate, reservationTime, durationMinutes, userId);
            reservation created = reservationService.createReservation(res);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Unable to create reservation: " + ex.getMessage()));
        }
    }

    @GetMapping("/reservations/user/{userId}")
    public ResponseEntity<?> getUserReservations(@PathVariable Long userId) {
        try {
            List<reservation> reservations = reservationService.getUserReservations(userId);
            return ResponseEntity.ok(reservations);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Unable to fetch reservations: " + ex.getMessage()));
        }
    }

    @GetMapping("/reservations/all")
    public @ResponseBody ArrayList<reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @GetMapping("/reservations/check")
    public ResponseEntity<?> checkAvailability(
            @RequestParam String consoleType,
            @RequestParam String reservationDate,
            @RequestParam String reservationTime) {
        try {
            LocalDate date = LocalDate.parse(reservationDate);
            LocalTime time = LocalTime.parse(reservationTime);
            boolean available = reservationService.isTimeSlotAvailable(consoleType, date, time);
            return ResponseEntity.ok(Map.of("available", available));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Unable to check availability: " + ex.getMessage()));
        }
    }
}

