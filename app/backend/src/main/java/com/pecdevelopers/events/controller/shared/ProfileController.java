package com.pecdevelopers.events.controller.shared;

import com.pecdevelopers.events.model.dto.ProfileUpdateRequest;
import com.pecdevelopers.events.model.dto.UserResponse;
import com.pecdevelopers.events.service.port.AuthServicePort;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final AuthServicePort authService;

    @PutMapping
    public ResponseEntity<UserResponse> updateProfile(
            @Valid @RequestBody ProfileUpdateRequest request,
            HttpServletRequest httpRequest) {
        String userIdAttr = (String) httpRequest.getAttribute("userId");
        if (userIdAttr == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }
        try {
            UUID userId = UUID.fromString(userIdAttr);
            UserResponse updatedUser = authService.updateProfile(userId, request);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid user identifier");
        }
    }
}
