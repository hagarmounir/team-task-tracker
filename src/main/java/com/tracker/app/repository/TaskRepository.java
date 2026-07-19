package com.tracker.app.repository;

import com.tracker.app.entity.Task;
import com.tracker.app.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {

    List<Task> findByProjectId(Long projectId);

    List<Task> findByAssigneeId(Long assigneeId);

    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);
}