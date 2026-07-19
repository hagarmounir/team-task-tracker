package com.tracker.app.dto;

import com.tracker.app.enums.ProjectStatus;

import java.time.OffsetDateTime;

public record ProjectResponse(
        Long id,
        String name,
        String description,
        ProjectStatus status,
        Long createdById,
        Long updatedById,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}