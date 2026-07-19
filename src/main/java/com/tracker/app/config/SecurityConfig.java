package com.tracker.app.config;

import com.tracker.app.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(org.springframework.security.config.Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public endpoints
                .requestMatchers("/api/users/register", "/api/users/login").permitAll()
                // Swagger / OpenAPI
                .requestMatchers(
                    "/swagger-ui/**", "/swagger-ui.html",
                    "/v3/api-docs/**"
                ).permitAll()
                // Project creation, updates, and deletion are restricted to ADMIN and PM
                .requestMatchers(HttpMethod.POST, "/api/projects").hasAnyRole("ADMINISTRATOR", "PROJECT_MANAGER")
                .requestMatchers(HttpMethod.PUT, "/api/projects/**").hasAnyRole("ADMINISTRATOR", "PROJECT_MANAGER")
                .requestMatchers(HttpMethod.DELETE, "/api/projects/**").hasAnyRole("ADMINISTRATOR", "PROJECT_MANAGER")
                // Member management sub-resource is restricted to ADMIN and PM
                .requestMatchers("/api/projects/*/members/**").hasAnyRole("ADMINISTRATOR", "PROJECT_MANAGER")
                // Task deletion is restricted to ADMIN and PM
                .requestMatchers(HttpMethod.DELETE, "/api/tasks/**").hasAnyRole("ADMINISTRATOR", "PROJECT_MANAGER")
                // User deactivation/activation is restricted to ADMIN
                .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMINISTRATOR")
                .requestMatchers(HttpMethod.PUT, "/api/users/*/activate").hasRole("ADMINISTRATOR")
                // All other requests require any authenticated user
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
        org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
        configuration.setAllowedOrigins(java.util.List.of("http://localhost:5173", "http://127.0.0.1:5173"));
        configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(java.util.List.of("*"));
        configuration.setAllowCredentials(true);
        
        org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
