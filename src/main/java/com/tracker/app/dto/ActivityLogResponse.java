package com.tracker.app.dto;

import java.time.OffsetDateTime;

public record ActivityLogResponse(
        Long id,
        String entityType,
        Long entityId,
        String action,
        Long userId,
        String details,
        OffsetDateTime createdAt
) {}