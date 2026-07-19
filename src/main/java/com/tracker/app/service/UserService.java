package com.tracker.app.service;

import com.tracker.app.dto.LoginResponse;
import com.tracker.app.dto.UserCreateRequest;
import com.tracker.app.dto.UserResponse;
import com.tracker.app.entity.User;
import com.tracker.app.repository.UserRepository;
import com.tracker.app.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    private UserResponse mapToResponse(User user) {
        return new UserResponse(
                user.getId(), user.getEmail(), user.getRole(),
                user.isActive(), user.getCreatedAt(), user.getUpdatedAt()
        );
    }
}