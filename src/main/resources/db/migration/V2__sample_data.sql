-- ============================================================
-- V2: Sample Data for Development & Testing
-- ============================================================
-- Passwords are BCrypt-hashed. Raw passwords:
--   admin@tracker.com     -> Admin@1234
--   pm@tracker.com        -> Manager@1234
--   alice@tracker.com     -> Member@1234
--   bob@tracker.com       -> Member@1234
-- ============================================================

INSERT INTO users (email, password_hash, role, is_active, created_at)
VALUES
    ('admin@tracker.com',
     '$2a$12$Fn3MdwX7v0X.9KMt3aPxQOFGd1QcM5y8bnV9BvVEfCblWIXdCRJhm',
     'ADMINISTRATOR', true, NOW()),
    ('pm@tracker.com',
     '$2a$12$sVVxthH2pCTRcW1HNqkNPOs3jD7S9T6WBJhwHFyEU8DqK4kNuaXR.',
     'PROJECT_MANAGER', true, NOW()),
    ('alice@tracker.com',
     '$2a$12$JKBeSzUbHRdyMbKkGh5vzu7WCCJXnmLy2w0fj0w8ZEGo7L7sZMBqy',
     'MEMBER', true, NOW()),
    ('bob@tracker.com',
     '$2a$12$JKBeSzUbHRdyMbKkGh5vzu7WCCJXnmLy2w0fj0w8ZEGo7L7sZMBqy',
     'MEMBER', true, NOW());

-- Projects
INSERT INTO projects (name, description, status, created_by, created_at)
VALUES
    ('Alpha Launch',
     'First public product release including core features',
     'ACTIVE',
     (SELECT id FROM users WHERE email = 'pm@tracker.com'),
     NOW()),
    ('Internal Tools',
     'Internal tooling and admin panel improvements',
     'ACTIVE',
     (SELECT id FROM users WHERE email = 'admin@tracker.com'),
     NOW());

-- Project members
INSERT INTO project_members (project_id, user_id)
VALUES
    ((SELECT id FROM projects WHERE name = 'Alpha Launch'),
     (SELECT id FROM users WHERE email = 'pm@tracker.com')),
    ((SELECT id FROM projects WHERE name = 'Alpha Launch'),
     (SELECT id FROM users WHERE email = 'alice@tracker.com')),
    ((SELECT id FROM projects WHERE name = 'Alpha Launch'),
     (SELECT id FROM users WHERE email = 'bob@tracker.com')),
    ((SELECT id FROM projects WHERE name = 'Internal Tools'),
     (SELECT id FROM users WHERE email = 'admin@tracker.com')),
    ((SELECT id FROM projects WHERE name = 'Internal Tools'),
     (SELECT id FROM users WHERE email = 'alice@tracker.com'));

-- Tasks
INSERT INTO tasks (project_id, title, description, priority, status, due_date, assignee_id, created_by, created_at)
VALUES
    ((SELECT id FROM projects WHERE name = 'Alpha Launch'),
     'Design landing page',
     'Create the initial design mockup for the public landing page',
     'HIGH', 'TODO',
     CURRENT_DATE + INTERVAL '7 days',
     (SELECT id FROM users WHERE email = 'alice@tracker.com'),
     (SELECT id FROM users WHERE email = 'pm@tracker.com'),
     NOW()),
    ((SELECT id FROM projects WHERE name = 'Alpha Launch'),
     'Set up CI/CD pipeline',
     'Configure GitHub Actions for automated testing and deployment',
     'CRITICAL', 'IN_PROGRESS',
     CURRENT_DATE + INTERVAL '3 days',
     (SELECT id FROM users WHERE email = 'bob@tracker.com'),
     (SELECT id FROM users WHERE email = 'pm@tracker.com'),
     NOW()),
    ((SELECT id FROM projects WHERE name = 'Alpha Launch'),
     'Write user documentation',
     'Create end-user documentation for the initial feature set',
     'MEDIUM', 'TODO',
     CURRENT_DATE + INTERVAL '14 days',
     NULL,
     (SELECT id FROM users WHERE email = 'pm@tracker.com'),
     NOW()),
    ((SELECT id FROM projects WHERE name = 'Internal Tools'),
     'Build admin dashboard',
     'Create an internal admin panel with user management capabilities',
     'HIGH', 'TODO',
     CURRENT_DATE + INTERVAL '10 days',
     (SELECT id FROM users WHERE email = 'alice@tracker.com'),
     (SELECT id FROM users WHERE email = 'admin@tracker.com'),
     NOW());

-- Sample comments
INSERT INTO comments (task_id, user_id, content, created_at)
VALUES
    ((SELECT id FROM tasks WHERE title = 'Set up CI/CD pipeline'),
     (SELECT id FROM users WHERE email = 'bob@tracker.com'),
     'Started working on this. GitHub Actions config is in progress.',
     NOW()),
    ((SELECT id FROM tasks WHERE title = 'Set up CI/CD pipeline'),
     (SELECT id FROM users WHERE email = 'pm@tracker.com'),
     'Great! Let me know if you need access to the deployment secrets.',
     NOW());

-- Activity log seed entries
INSERT INTO activity_logs (entity_type, entity_id, action, user_id, details, created_at)
VALUES
    ('PROJECT',
     (SELECT id FROM projects WHERE name = 'Alpha Launch'),
     'CREATED',
     (SELECT id FROM users WHERE email = 'pm@tracker.com'),
     'Project created: Alpha Launch',
     NOW()),
    ('PROJECT',
     (SELECT id FROM projects WHERE name = 'Internal Tools'),
     'CREATED',
     (SELECT id FROM users WHERE email = 'admin@tracker.com'),
     'Project created: Internal Tools',
     NOW());
