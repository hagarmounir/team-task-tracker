package com.tracker.app.dto;

import com.tracker.app.enums.TaskPriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record TaskCreateRequest(
        @NotNull(message = "Project ID is required")
        Long projectId,

        @NotBlank(message = "Title is required")
        String title,

        String description,

        @NotNull(message = "Priority is required")
        TaskPriority priority,

        LocalDate dueDate,

        Long assigneeId
) {}