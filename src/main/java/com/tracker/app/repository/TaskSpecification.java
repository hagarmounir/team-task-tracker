package com.tracker.app.repository;

import com.tracker.app.entity.Task;
import com.tracker.app.enums.TaskStatus;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Dynamic JPA Specification for task filtering.
 * Each filter is optional — only non-null values are applied.
 */
public class TaskSpecification {

    private TaskSpecification() {}

    public static Specification<Task> withFilters(
            Long projectId,
            Long assigneeId,
            TaskStatus status,
            LocalDate dueDateFrom,
            LocalDate dueDateTo
    ) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (projectId != null) {
                predicates.add(cb.equal(root.get("project").get("id"), projectId));
            }
            if (assigneeId != null) {
                predicates.add(cb.equal(root.get("assignee").get("id"), assigneeId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (dueDateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("dueDate"), dueDateFrom));
            }
            if (dueDateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("dueDate"), dueDateTo));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
