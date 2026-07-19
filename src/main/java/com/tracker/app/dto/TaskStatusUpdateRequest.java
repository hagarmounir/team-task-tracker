package com.tracker.app.dto;

import com.tracker.app.enums.TaskStatus;
import jakarta.validation.constraints.NotNull;

public record TaskStatusUpdateRequest(
        @NotNull(message = "New status is required")
        TaskStatus status
) {}