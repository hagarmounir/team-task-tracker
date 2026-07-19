package com.tracker.app.dto;

import jakarta.validation.constraints.Email;

public record UserUpdateRequest(
        @Email(message = "Invalid email format")
        String email,

        String role,

        Boolean isActive
) {}