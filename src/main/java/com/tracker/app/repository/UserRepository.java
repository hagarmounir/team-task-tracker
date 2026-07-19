package com.tracker.app.repository;

import com.tracker.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    // Leverages our partial index (idx_active_users) for fast lookups
    Optional<User> findByEmailAndIsActiveTrue(String email);

    Optional<User> findByIdAndIsActiveTrue(Long id);

    boolean existsByEmail(String email);
}