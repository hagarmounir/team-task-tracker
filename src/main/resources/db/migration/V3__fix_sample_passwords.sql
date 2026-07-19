-- ============================================================
-- V3: Fix sample user password hashes
-- Passwords were incorrectly pre-computed in V2.
-- These are properly BCrypt-hashed (rounds=12, $2a$ prefix).
--
-- Credentials:
--   admin@tracker.com   → Admin@1234
--   pm@tracker.com      → Manager@1234
--   alice@tracker.com   → Member@1234
--   bob@tracker.com     → Member@1234
-- ============================================================

UPDATE users SET password_hash = '$2a$12$aubI94.QaJDocjqGYsC4luYOP7h1k41Y9VEApKVKXC7ryFkkNiTGa'
WHERE email = 'admin@tracker.com';

UPDATE users SET password_hash = '$2a$12$vwwHoeqZlY5TZAtYyw0bBeZc07LZUXGhCfCf/6YP1l3wDRv6.9Uke'
WHERE email = 'pm@tracker.com';

UPDATE users SET password_hash = '$2a$12$laCvwOvqL/J4/7F7K9CoheG1Dj4FONLutF2NrVXnSupzY6gXQGaGG'
WHERE email = 'alice@tracker.com';

UPDATE users SET password_hash = '$2a$12$laCvwOvqL/J4/7F7K9CoheG1Dj4FONLutF2NrVXnSupzY6gXQGaGG'
WHERE email = 'bob@tracker.com';
