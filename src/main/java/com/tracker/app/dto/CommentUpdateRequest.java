package com.tracker.app.dto;

import jakarta.validation.constraints.NotBlank;

public record CommentUpdateRequest(
        @NotBlank(message = "Content cannot be empty")
        String content
) {}