package com.tracker.app.service;

import com.tracker.app.entity.ActivityLog;
import com.tracker.app.entity.User;
import com.tracker.app.repository.ActivityLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class ActivityLogService {

    private final ActivityLogRepository activityLogRepository;

    // Joins the parent transaction — log commits when the business operation commits,
    // and rolls back together if the operation fails (no orphan logs for failed ops).
    @Transactional(propagation = Propagation.REQUIRED)
    public void logActivity(String entityType, Long entityId, String action, User user, String details) {
        ActivityLog log = new ActivityLog();
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setAction(action);
        log.setUser(user);
        log.setDetails(details);
        log.setCreatedAt(OffsetDateTime.now()); // Preserves exact local time zone

        activityLogRepository.save(log);
    }
}