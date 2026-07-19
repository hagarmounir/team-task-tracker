package com.tracker.app.dto;

import com.tracker.app.enums.TaskPriority;
import com.tracker.app.enums.TaskStatus;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record TaskResponse(
        Long id,
        Long projectId,
        String title,
        String description,
        TaskPriority priority,
        TaskStatus status,
        LocalDate dueDate,
        Long assigneeId,
        Long createdById,
        Long updatedById,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}