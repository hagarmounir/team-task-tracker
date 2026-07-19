package com.tracker.app.service;

import com.tracker.app.dto.TaskCreateRequest;
import com.tracker.app.dto.TaskResponse;
import com.tracker.app.dto.TaskStatusUpdateRequest;
import com.tracker.app.dto.TaskUpdateRequest;
import com.tracker.app.entity.Project;
import com.tracker.app.entity.Task;
import com.tracker.app.entity.User;
import com.tracker.app.enums.TaskStatus;
import com.tracker.app.enums.UserRole;
import com.tracker.app.repository.ProjectRepository;
import com.tracker.app.repository.TaskRepository;
import com.tracker.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Transactional
    public TaskResponse createTask(TaskCreateRequest request, String creatorEmail) {
        Project project = findProjectById(request.projectId());
        User creator = findUserByEmail(creatorEmail);

        // Business rule: only project members can create tasks within a project
        if (!project.getMembers().contains(creator) && creator.getRole() == UserRole.MEMBER) {
            throw new AccessDeniedException("You are not a member of this project");
        }

        Task task = new Task();
        task.setProject(project);
        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setStatus(TaskStatus.TODO);
        task.setCreatedBy(creator);
        task.setCreatedAt(OffsetDateTime.now());

        if (request.assigneeId() != null) {
            User assignee = findUserById(request.assigneeId());
            // Business rule: assignee must be a project member
            if (!project.getMembers().contains(assignee)) {
                throw new IllegalArgumentException("Assignee must be a member of the project");
            }
            task.setAssignee(assignee);
        }

        Task saved = taskRepository.save(task);
        log.info("Task created [id={}] in project [id={}] by [{}]", saved.getId(), project.getId(), creatorEmail);
        activityLogService.logActivity("TASK", saved.getId(), "CREATED", creator,
                "Task created in project: " + project.getName());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTaskById(Long taskId) {
        return mapToResponse(findTaskById(taskId));
    }

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public TaskResponse updateTask(Long taskId, TaskUpdateRequest request, String updaterEmail) {
        Task task = findTaskById(taskId);
        User updater = findUserByEmail(updaterEmail);

        // Business rule: MEMBER can only update their own assigned tasks
        if (updater.getRole() == UserRole.MEMBER) {
            if (task.getAssignee() == null || !task.getAssignee().getId().equals(updater.getId())) {
                throw new AccessDeniedException("Members can only update tasks assigned to them");
            }
        }

        if (request.title() != null && !request.title().isBlank()) {
            task.setTitle(request.title());
        }
        if (request.description() != null) {
            task.setDescription(request.description());
        }
        if (request.priority() != null) {
            task.setPriority(request.priority());
        }
        if (request.dueDate() != null) {
            task.setDueDate(request.dueDate());
        }
        if (request.assigneeId() != null) {
            User assignee = findUserById(request.assigneeId());
            if (!task.getProject().getMembers().contains(assignee)) {
                throw new IllegalArgumentException("Assignee must be a member of the project");
            }
            String previousAssignee = task.getAssignee() != null ? task.getAssignee().getEmail() : "none";
            task.setAssignee(assignee);
            activityLogService.logActivity("TASK", task.getId(), "REASSIGNED", updater,
                    "Task reassigned from " + previousAssignee + " to " + assignee.getEmail());
        }

        task.setUpdatedBy(updater);
        task.setUpdatedAt(OffsetDateTime.now());

        Task saved = taskRepository.save(task);
        log.info("Task updated [id={}] by [{}]", saved.getId(), updaterEmail);
        activityLogService.logActivity("TASK", saved.getId(), "UPDATED", updater, "Task details updated");

        return mapToResponse(saved);
    }

    @Transactional
    public TaskResponse updateTaskStatus(Long taskId, TaskStatusUpdateRequest request, String updaterEmail) {
        Task task = findTaskById(taskId);
        User updater = findUserByEmail(updaterEmail);

        // Business rule: MEMBER can only update status of tasks assigned to them
        if (updater.getRole() == UserRole.MEMBER) {
            if (task.getAssignee() == null || !task.getAssignee().getId().equals(updater.getId())) {
                throw new AccessDeniedException("Members can only change status of tasks assigned to them");
            }
        }

        TaskStatus oldStatus = task.getStatus();
        validateStateTransition(oldStatus, request.status());

        task.setStatus(request.status());
        task.setUpdatedBy(updater);
        task.setUpdatedAt(OffsetDateTime.now());

        Task saved = taskRepository.save(task);
        log.info("Task [id={}] status changed from {} to {} by [{}]", saved.getId(), oldStatus, request.status(), updaterEmail);
        activityLogService.logActivity("TASK", saved.getId(), "STATUS_UPDATED", updater,
                "Status changed from " + oldStatus + " to " + request.status());

        return mapToResponse(saved);
    }

    // --- State machine ---

    private void validateStateTransition(TaskStatus current, TaskStatus next) {
        if (current == next) return;

        boolean valid = switch (current) {
            case TODO       -> next == TaskStatus.IN_PROGRESS || next == TaskStatus.CANCELLED;
            case IN_PROGRESS -> next == TaskStatus.DONE || next == TaskStatus.TODO || next == TaskStatus.CANCELLED;
            case DONE       -> next == TaskStatus.REOPENED;
            case REOPENED   -> next == TaskStatus.IN_PROGRESS || next == TaskStatus.CANCELLED;
            case CANCELLED  -> next == TaskStatus.REOPENED;
        };

        if (!valid) {
            throw new IllegalStateException(
                    "Invalid status transition from " + current + " to " + next);
        }
    }

    // --- Private helpers ---

    private Task findTaskById(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found: " + id));
    }

    private Project findProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    private TaskResponse mapToResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getProject().getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getStatus(),
                task.getDueDate(),
                task.getAssignee() != null ? task.getAssignee().getId() : null,
                task.getCreatedBy() != null ? task.getCreatedBy().getId() : null,
                task.getUpdatedBy() != null ? task.getUpdatedBy().getId() : null,
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}