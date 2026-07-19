package com.tracker.app.dto;

import com.tracker.app.enums.UserRole;

import java.time.OffsetDateTime;

public record UserResponse(
        Long id,
        String email,
        UserRole role,
        boolean isActive,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}