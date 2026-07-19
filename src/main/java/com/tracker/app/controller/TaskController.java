package com.tracker.app.controller;

import com.tracker.app.dto.TaskCreateRequest;
import com.tracker.app.dto.TaskResponse;
import com.tracker.app.dto.TaskStatusUpdateRequest;
import com.tracker.app.dto.TaskUpdateRequest;
import com.tracker.app.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Tasks", description = "Task lifecycle management")
public class TaskController {

    private final TaskService taskService;

    @Operation(summary = "Create a new task within a project")
    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            @Valid @RequestBody TaskCreateRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request, email));
    }

    @Operation(summary = "Get a task by ID")
    @GetMapping("/{id}")
    public ResponseEntity<TaskResponse> getTask(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @Operation(summary = "Get all tasks for a project")
    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<List<TaskResponse>> getTasksByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @Operation(summary = "Update a task (MEMBER: only assigned tasks; ADMIN/PM: any task)")
    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            @PathVariable Long id,
            @RequestBody TaskUpdateRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(taskService.updateTask(id, request, email));
    }

    @Operation(summary = "Update task status (MEMBER: only assigned tasks; ADMIN/PM: any task)")
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskResponse> updateTaskStatus(
            @PathVariable Long id,
            @Valid @RequestBody TaskStatusUpdateRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(taskService.updateTaskStatus(id, request, email));
    }
}
