package com.tracker.app.service;

import com.tracker.app.dto.CommentCreateRequest;
import com.tracker.app.dto.CommentResponse;
import com.tracker.app.dto.CommentUpdateRequest;
import com.tracker.app.entity.Comment;
import com.tracker.app.entity.Task;
import com.tracker.app.entity.User;
import com.tracker.app.enums.UserRole;
import com.tracker.app.repository.CommentRepository;
import com.tracker.app.repository.TaskRepository;
import com.tracker.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

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
        User user = findUserByEmail(commenterEmail);

        boolean isMember = task.getProject().getMembers().contains(user);
        boolean isPrivileged = user.getRole() == UserRole.ADMINISTRATOR || user.getRole() == UserRole.PROJECT_MANAGER;
        if (!isMember && !isPrivileged) {
            throw new AccessDeniedException("You are not a member of this project");
        }

        Comment comment = new Comment();
        comment.setTask(task);
        comment.setUser(user);
        comment.setContent(request.content());
        comment.setCreatedAt(OffsetDateTime.now());

        Comment saved = commentRepository.save(comment);
        log.info("Comment added to task [id={}] by [{}]", task.getId(), commenterEmail);
        activityLogService.logActivity("TASK", task.getId(), "COMMENT_ADDED", user, "Comment added to task: " + task.getTitle());
        return mapToResponse(saved);
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, CommentUpdateRequest request, String updaterEmail) {
        Comment comment = findCommentById(commentId);
        User updater = findUserByEmail(updaterEmail);

        // Business rule: only the author can edit their comment
        if (!comment.getUser().getId().equals(updater.getId())) {
            throw new AccessDeniedException("You can only edit your own comments");
        }

        comment.setContent(request.content());
        comment.setUpdatedAt(OffsetDateTime.now());
        Comment saved = commentRepository.save(comment);

        log.info("Comment [id={}] updated by [{}]", commentId, updaterEmail);
        activityLogService.logActivity("TASK", comment.getTask().getId(), "COMMENT_UPDATED", updater,
                "Comment updated on task: " + comment.getTask().getTitle());
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteComment(Long commentId, String requesterEmail) {
        Comment comment = findCommentById(commentId);
        User requester = findUserByEmail(requesterEmail);

        // Business rule: author can delete their own; ADMIN/PM can delete any comment
        boolean isAuthor = comment.getUser().getId().equals(requester.getId());
        boolean isPrivileged = requester.getRole() == UserRole.ADMINISTRATOR || requester.getRole() == UserRole.PROJECT_MANAGER;
        if (!isAuthor && !isPrivileged) {
            throw new AccessDeniedException("You can only delete your own comments");
        }

        Long taskId = comment.getTask().getId();
        String taskTitle = comment.getTask().getTitle();
        commentRepository.delete(comment);

        log.info("Comment [id={}] deleted by [{}]", commentId, requesterEmail);
        activityLogService.logActivity("TASK", taskId, "COMMENT_DELETED", requester, "Comment deleted on task: " + taskTitle);
    }

    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByTask(Long taskId) {
        return commentRepository.findByTaskIdOrderByCreatedAtAsc(taskId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private Comment findCommentById(Long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + id));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found or is deactivated: " + email));
    }

    private CommentResponse mapToResponse(Comment c) {
        return new CommentResponse(c.getId(), c.getTask().getId(), c.getUser().getId(),
                c.getContent(), null, c.getCreatedAt(), c.getUpdatedAt());
    }
}