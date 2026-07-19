package com.tracker.app.dto;

import jakarta.validation.constraints.NotBlank;

public record ProjectCreateRequest(
        @NotBlank(message = "Project name is required")
        String name,

        String description
) {}