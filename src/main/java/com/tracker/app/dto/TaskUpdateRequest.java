package com.tracker.app.dto;

import com.tracker.app.enums.TaskPriority;
import java.time.LocalDate;

import jakarta.validation.constraints.Size;

public record TaskUpdateRequest(
        @Size(min = 1, message = "Task title cannot be empty if provided")
        String title,
        String description,
        TaskPriority priority,
        LocalDate dueDate,
        Long assigneeId
) {}