package com.tracker.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommentCreateRequest(
        @NotNull(message = "Task ID is required")
        Long taskId,

        @NotBlank(message = "Content is required")
        String content
) {}