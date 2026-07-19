package com.tracker.app.controller;

import com.tracker.app.dto.CommentCreateRequest;
import com.tracker.app.dto.CommentResponse;
import com.tracker.app.service.CommentService;
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
@RequestMapping("/api/comments")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Comments", description = "Task comments")
public class CommentController {

    private final CommentService commentService;

    @Operation(summary = "Add a comment to a task (project members only)")
    @PostMapping
    public ResponseEntity<CommentResponse> addComment(
            @Valid @RequestBody CommentCreateRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commentService.addComment(request, email));
    }

    @Operation(summary = "Get all comments for a task")
    @GetMapping("/by-task/{taskId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(commentService.getCommentsByTask(taskId));
    }

    @Operation(summary = "Update a comment (Author only)")
    @PutMapping("/{id}")
    public ResponseEntity<CommentResponse> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody com.tracker.app.dto.CommentUpdateRequest request,
            @AuthenticationPrincipal String email) {
        return ResponseEntity.ok(commentService.updateComment(id, request, email));
    }

    @Operation(summary = "Delete a comment (Author or ADMIN/PM)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long id,
            @AuthenticationPrincipal String email) {
        commentService.deleteComment(id, email);
        return ResponseEntity.noContent().build();
    }
}
