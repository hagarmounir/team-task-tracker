package com.tracker.app.dto;

public record LoginResponse(
        String token,
        String email,
        String role
) {}
