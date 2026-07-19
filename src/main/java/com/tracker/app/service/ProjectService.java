package com.tracker.app.service;

import com.tracker.app.dto.ProjectCreateRequest;
import com.tracker.app.dto.ProjectResponse;
import com.tracker.app.dto.ProjectUpdateRequest;
import com.tracker.app.entity.Project;
import com.tracker.app.entity.User;
import com.tracker.app.enums.ProjectStatus;
import com.tracker.app.repository.ProjectRepository;
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
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final ActivityLogService activityLogService;

    @Transactional
    public ProjectResponse createProject(ProjectCreateRequest request, String creatorEmail) {
        User creator = findUserByEmail(creatorEmail);

        Project project = new Project();
        project.setName(request.name());
        project.setDescription(request.description());
        project.setStatus(ProjectStatus.ACTIVE);
        project.setCreatedBy(creator);
        project.setCreatedAt(OffsetDateTime.now());
        project.getMembers().add(creator); // Creator is automatically a member

        Project saved = projectRepository.save(project);
        log.info("Project created [id={}] by user [{}]", saved.getId(), creatorEmail);
        activityLogService.logActivity("PROJECT", saved.getId(), "CREATED", creator,
                "Project created: " + saved.getName());

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProjectById(Long id) {
        return mapToResponse(findProjectById(id));
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> getAllProjects() {
        return projectRepository.findAll().stream().map(this::mapToResponse).toList();
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, ProjectUpdateRequest request, String updaterEmail) {
        Project project = findProjectById(projectId);
        User updater = findUserByEmail(updaterEmail);

        if (request.name() != null && !request.name().isBlank()) {
            project.setName(request.name());
        }
        if (request.description() != null) {
            project.setDescription(request.description());
        }
        if (request.status() != null) {
            String oldStatus = project.getStatus().name();
            project.setStatus(request.status());
            activityLogService.logActivity("PROJECT", project.getId(), "STATUS_CHANGED", updater,
                    "Status changed from " + oldStatus + " to " + request.status().name());
        }

        project.setUpdatedBy(updater);
        project.setUpdatedAt(OffsetDateTime.now());

        Project saved = projectRepository.save(project);
        log.info("Project updated [id={}] by user [{}]", saved.getId(), updaterEmail);
        activityLogService.logActivity("PROJECT", saved.getId(), "UPDATED", updater,
                "Project updated: " + saved.getName());

        return mapToResponse(saved);
    }

    @Transactional
    public void addMember(Long projectId, Long userId, String requesterEmail) {
        Project project = findProjectById(projectId);
        User userToAdd = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        User requester = findUserByEmail(requesterEmail);

        if (project.getMembers().contains(userToAdd)) {
            throw new IllegalStateException("User is already a member of this project");
        }

        project.getMembers().add(userToAdd);
        projectRepository.save(project);

        log.info("User [{}] added to project [id={}] by [{}]", userId, projectId, requesterEmail);
        activityLogService.logActivity("PROJECT", projectId, "MEMBER_ADDED", requester,
                "User " + userToAdd.getEmail() + " added to project");
    }

    @Transactional
    public void removeMember(Long projectId, Long userId, String requesterEmail) {
        Project project = findProjectById(projectId);
        User userToRemove = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        User requester = findUserByEmail(requesterEmail);

        if (project.getCreatedBy().getId().equals(userId)) {
            throw new IllegalStateException("Cannot remove the project creator from the project");
        }

        project.getMembers().remove(userToRemove);
        projectRepository.save(project);

        log.info("User [{}] removed from project [id={}] by [{}]", userId, projectId, requesterEmail);
        activityLogService.logActivity("PROJECT", projectId, "MEMBER_REMOVED", requester,
                "User " + userToRemove.getEmail() + " removed from project");
    }

    // --- Private helpers ---

    private Project findProjectById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Project not found: " + id));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private ProjectResponse mapToResponse(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getDescription(),
                project.getStatus(),
                project.getCreatedBy() != null ? project.getCreatedBy().getId() : null,
                project.getUpdatedBy() != null ? project.getUpdatedBy().getId() : null,
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}