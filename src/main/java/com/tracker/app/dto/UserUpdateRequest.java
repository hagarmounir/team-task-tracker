package com.tracker.app.dto;

import com.tracker.app.enums.UserRole;
import jakarta.validation.constraints.Email;

public record UserUpdateRequest(
        @Email(message = "Invalid email format")
        String email
) {}