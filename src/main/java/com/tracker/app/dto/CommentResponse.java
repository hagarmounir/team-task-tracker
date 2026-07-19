package com.tracker.app.dto;

import java.time.OffsetDateTime;

public record CommentResponse(
        Long id,
        Long taskId,
        Long userId,
        String content,
        Long updatedById,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {}