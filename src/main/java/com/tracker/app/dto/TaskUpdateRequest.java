package com.tracker.app.dto;

import com.tracker.app.enums.TaskPriority;
import java.time.LocalDate;

public record TaskUpdateRequest(
        String title,
        String description,
        TaskPriority priority,
        LocalDate dueDate,
        Long assigneeId
) {}