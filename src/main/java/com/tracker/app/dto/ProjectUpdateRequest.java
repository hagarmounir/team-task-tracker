package com.tracker.app.dto;

import com.tracker.app.enums.ProjectStatus;

public record ProjectUpdateRequest(
        String name,
        String description,
        ProjectStatus status
) {}