package com.tracker.app.controller;

import com.tracker.app.dto.LoginRequest;
import com.tracker.app.dto.LoginResponse;
import com.tracker.app.dto.UserCreateRequest;
import com.tracker.app.dto.UserResponse;
import com.tracker.app.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
@Tag(name = "Users", description = "User registration and authentication")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Register a new user")
    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.registerUser(request));
    }

    @Operation(summary = "Login and receive a JWT token")
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(userService.login(request.email(), request.password()));
    }

    @Operation(summary = "Update user profile (Own profile or ADMIN)")
    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody com.tracker.app.dto.UserUpdateRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String email) {
        return ResponseEntity.ok(userService.updateUser(id, request, email));
    }

    @Operation(summary = "Change own password")
    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long id,
            @Valid @RequestBody com.tracker.app.dto.UserPasswordUpdateRequest request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String email) {
        userService.changePassword(id, request, email);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Deactivate a user (ADMIN only)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivateUser(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String email) {
        userService.deactivateUser(id, email);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Reactivate a user (ADMIN only)")
    @PutMapping("/{id}/activate")
    public ResponseEntity<Void> activateUser(
            @PathVariable Long id,
            @org.springframework.security.core.annotation.AuthenticationPrincipal String email) {
        userService.activateUser(id, email);
        return ResponseEntity.noContent().build();
    }
}
