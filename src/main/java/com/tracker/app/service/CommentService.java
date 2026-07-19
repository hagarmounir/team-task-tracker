package com.tracker.app.service;

import com.tracker.app.dto.CommentCreateRequest;
import com.tracker.app.dto.CommentResponse;
import com.tracker.app.entity.Comment;
import com.tracker.app.entity.Task;
import com.tracker.app.entity.User;
import com.tracker.app.enums.UserRole;
import com.tracker.app.repository.CommentRepository;
import com.tracker.app.repository.TaskRepository;
import com.tracker.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Transactional
    public CommentResponse addComment(CommentCreateRequest request, String commenterEmail) {
        Task task = taskRepository.findById(request.taskId())
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + request.taskId()));

        User user = userRepository.findByEmail(commenterEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + commenterEmail));

        // Business rule: MEMBER can only comment on tasks in projects they belong to.
        // ADMINISTRATOR and PROJECT_MANAGER can comment on any project.
        boolean isMember = task.getProject().getMembers().contains(user);
        boolean isPrivileged = user.getRole() == UserRole.ADMINISTRATOR
                || user.getRole() == UserRole.PROJECT_MANAGER;

        if (!isMember && !isPrivileged) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "You are not a member of this project");
        }

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setContent(request.content());
        comment.setCreatedAt(OffsetDateTime.now());

        Comment saved = commentRepository.save(comment);
        log.info("Comment added to task [id={}] by [{}]", task.getId(), commenterEmail);
        activityLogService.logActivity("TASK", task.getId(), "COMMENT_ADDED", user,
                "Comment added to task: " + task.getTitle());

        return new CommentResponse(
                saved.getId(), saved.getTask().getId(),
                saved.getUser().getId(), saved.getContent(),
                null,
                saved.getCreatedAt(), saved.getUpdatedAt()
        );
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByTask(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(c -> new CommentResponse(
                        c.getId(), c.getTask().getId(),
                        c.getUser().getId(), c.getContent(),
                        null,
                        c.getCreatedAt(), c.getUpdatedAt()))
                .collect(java.util.stream.Collectors.toList());
    }
}