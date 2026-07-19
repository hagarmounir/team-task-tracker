package com.tracker.app.dto;

import com.tracker.app.enums.UserRole;
import jakarta.validation.constraints.Email;

public record UserUpdateRequest(
        @Email(regexp = "^[a-zA-Z0-9_+&*-]+(?:\\.[a-zA-Z0-9_+&*-]+)*@(?:[a-zA-Z0-9-]+\\.)+[a-zA-Z]{2,7}$", message = "Invalid email format")
        String email,
        UserRole role
) {}