package com.tracker.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommentUpdateRequest(
        @NotNull(message = "Requesting User ID is required to verify ownership")
        Long requestingUserId,

        @NotBlank(message = "Content cannot be empty")
        String content
) {}