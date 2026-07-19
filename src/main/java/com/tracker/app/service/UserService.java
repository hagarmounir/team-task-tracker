package com.tracker.app.service;

import com.tracker.app.dto.LoginResponse;
import com.tracker.app.dto.UserCreateRequest;
import com.tracker.app.dto.UserPasswordUpdateRequest;
import com.tracker.app.dto.UserResponse;
import com.tracker.app.dto.UserUpdateRequest;
import com.tracker.app.entity.User;
import com.tracker.app.enums.UserRole;
import com.tracker.app.repository.UserRepository;
import com.tracker.app.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ActivityLogService activityLogService;
    private final JwtUtil jwtUtil;

    @Transactional
    public UserResponse registerUser(UserCreateRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already in use: " + request.email());
        }
        User user = new User();
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.setRole(request.role());
        user.setActive(true);
        user.setCreatedAt(OffsetDateTime.now());

        User saved = userRepository.save(user);
        log.info("New user registered [email={}] with role [{}]", saved.getEmail(), saved.getRole());
        activityLogService.logActivity("USER", saved.getId(), "REGISTERED", saved, "User account created");
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public LoginResponse login(String email, String rawPassword) {
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new SecurityException("Invalid credentials or inactive account"));
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new SecurityException("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        log.info("User logged in [email={}]", email);
        return new LoginResponse(token, user.getEmail(), user.getRole().name());
    }

    /**
     * Update user profile.
     * - ADMIN can update any user (email).
     * - A user can update only their own email.
     */
    @Transactional
    public UserResponse updateUser(Long targetUserId, UserUpdateRequest request, String requesterEmail) {
        User target = findUserById(targetUserId);
        User requester = findUserByEmail(requesterEmail);

        boolean isSelf = target.getId().equals(requester.getId());
        boolean isAdmin = requester.getRole() == UserRole.ADMINISTRATOR;

        if (!isSelf && !isAdmin) {
            throw new AccessDeniedException("You can only update your own profile");
        }

        if (request.email() != null && !request.email().isBlank()) {
            if (!request.email().equals(target.getEmail()) && userRepository.existsByEmail(request.email())) {
                throw new IllegalArgumentException("Email already in use: " + request.email());
            }
            target.setEmail(request.email());
        }



        target.setUpdatedAt(OffsetDateTime.now());
        User saved = userRepository.save(target);

        log.info("User [id={}] updated by [{}]", targetUserId, requesterEmail);
        activityLogService.logActivity("USER", saved.getId(), "UPDATED", requester, "User profile updated");
        return mapToResponse(saved);
    }

    /**
     * Change own password. Users can only change their own password.
     */
    @Transactional
    public void changePassword(Long targetUserId, UserPasswordUpdateRequest request, String requesterEmail) {
        User target = findUserById(targetUserId);
        User requester = findUserByEmail(requesterEmail);

        if (!target.getId().equals(requester.getId())) {
            throw new AccessDeniedException("You can only change your own password");
        }
        if (!passwordEncoder.matches(request.currentPassword(), target.getPasswordHash())) {
            throw new SecurityException("Current password is incorrect");
        }

        target.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        target.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(target);

        log.info("Password changed for user [id={}]", targetUserId);
        activityLogService.logActivity("USER", target.getId(), "PASSWORD_CHANGED", requester, "Password changed");
    }

    /**
     * Soft-delete a user (set isActive=false). ADMIN only.
     */
    @Transactional
    public void deactivateUser(Long targetUserId, String requesterEmail) {
        User target = findUserById(targetUserId);
        User requester = findUserByEmail(requesterEmail);

        if (target.getId().equals(requester.getId())) {
            throw new IllegalStateException("Administrators cannot deactivate their own account");
        }

        target.setActive(false);
        target.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(target);

        log.info("User [id={}] deactivated by admin [{}]", targetUserId, requesterEmail);
        activityLogService.logActivity("USER", target.getId(), "DEACTIVATED", requester, "User account deactivated");
    }

    /**
     * Reactivate a user (set isActive=true). ADMIN only.
     */
    @Transactional
    public void activateUser(Long targetUserId, String requesterEmail) {
        User target = findUserById(targetUserId);
        User requester = findUserByEmail(requesterEmail);

        if (target.isActive()) {
            throw new IllegalStateException("User is already active");
        }

        target.setActive(true);
        target.setUpdatedAt(OffsetDateTime.now());
        userRepository.save(target);

        log.info("User [id={}] activated by admin [{}]", targetUserId, requesterEmail);
        activityLogService.logActivity("USER", target.getId(), "ACTIVATED", requester, "User account activated");
    }

    private User findUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new IllegalArgumentException("Requester not found or is deactivated: " + email));
    }

    private UserResponse mapToResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getRole(),
                user.isActive(), user.getCreatedAt(), user.getUpdatedAt());
    }
}