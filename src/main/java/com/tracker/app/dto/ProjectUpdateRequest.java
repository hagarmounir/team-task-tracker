package com.tracker.app.dto;

import com.tracker.app.enums.ProjectStatus;

import jakarta.validation.constraints.Size;

public record ProjectUpdateRequest(
        @Size(min = 1, message = "Project name cannot be empty if provided")
        String name,
        String description,
        ProjectStatus status
) {}