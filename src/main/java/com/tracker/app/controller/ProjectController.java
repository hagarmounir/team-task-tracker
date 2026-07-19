package com.tracker.app.controller;

import com.tracker.app.dto.ProjectCreateRequest;
import com.tracker.app.dto.ProjectResponse;
import com.tracker.app.dto.ProjectUpdateRequest;
import com.tracker.app.service.ProjectService;
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
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Projects", description = "Project lifecycle management")
public class ProjectController {

    private final ProjectService projectService;

    @Operation(summary = "Create a new project (ADMIN, PM only)")
    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(
            @Valid @RequestBody ProjectCreateRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.CREATED).body(projectService.createProject(request, email));
    }

    @Operation(summary = "Get all projects")
    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getAllProjects(@AuthenticationPrincipal String email) {
        return ResponseEntity.ok(projectService.getAllProjects(email));
    }

    @Operation(summary = "Get a project by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long id) {
        return ResponseEntity.ok(projectService.getProjectById(id));
    }

    @Operation(summary = "Update a project (ADMIN, PM only)")
    @PutMapping("/{id}")
    public ResponseEntity<ProjectResponse> updateProject(
            @PathVariable Long id,
            @Valid @RequestBody ProjectUpdateRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(projectService.updateProject(id, request, email));
    }

    @Operation(summary = "Add a member to a project (ADMIN, PM only)")
    @PostMapping("/{projectId}/members/{userId}")
    public ResponseEntity<Void> addMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @AuthenticationPrincipal String email) {
        projectService.addMember(projectId, userId, email);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Get all members of a project")
    @GetMapping("/{projectId}/members")
    public ResponseEntity<List<com.tracker.app.dto.UserResponse>> getProjectMembers(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProjectMembers(projectId));
    }

    @Operation(summary = "Remove a member from a project (ADMIN, PM only)")
    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            @AuthenticationPrincipal String email) {
        projectService.removeMember(projectId, userId, email);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Delete a project (ADMIN, PM only)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProject(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        projectService.deleteProject(id, email);
        return ResponseEntity.noContent().build();
    }
}
