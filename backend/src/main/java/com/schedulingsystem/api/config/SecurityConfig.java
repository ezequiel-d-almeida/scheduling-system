package com.schedulingsystem.api.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schedulingsystem.api.repository.AdminAccountRepository;
import java.util.List;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableConfigurationProperties(SecurityProperties.class)
public class SecurityConfig {
    @Bean
    ObjectMapper objectMapper() { return new ObjectMapper().findAndRegisterModules(); }

    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    UserDetailsService userDetailsService(AdminAccountRepository accounts) {
        return username -> accounts.findByUsername(username)
                .map(account -> new User(account.getUsername(), account.getPasswordHash(), account.isEnabled(), true, true, true,
                        List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))))
                .orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Invalid credentials"));
    }

    @Bean
    DaoAuthenticationProvider authenticationProvider(UserDetailsService users, PasswordEncoder passwordEncoder) {
        var provider = new DaoAuthenticationProvider(users);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, SecurityErrorHandler errors,
                                            @Qualifier("corsConfigurationSource") CorsConfigurationSource cors) throws Exception {
        var csrf = CookieCsrfTokenRepository.withHttpOnlyFalse();
        csrf.setCookiePath("/");
        http
                .cors(corsConfigurer -> corsConfigurer.configurationSource(cors))
                .csrf(csrfConfigurer -> csrfConfigurer
                        .csrfTokenRepository(csrf)
                        .ignoringRequestMatchers("/api/public/**", "/api/health"))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/api/public/**", "/api/health", "/api/auth/csrf", "/api/auth/login", "/api/auth/me").permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .anyRequest().hasRole("ADMIN"))
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(errors).accessDeniedHandler(errors));
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(SecurityProperties properties) {
        var configuredOrigins = properties.getAllowedOrigins().stream().filter(origin -> !origin.isBlank()).toList();
        var source = new UrlBasedCorsConfigurationSource();
        if (!configuredOrigins.isEmpty()) {
            var configuration = new CorsConfiguration();
            configuration.setAllowedOrigins(configuredOrigins);
            configuration.setAllowCredentials(true);
            configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
            configuration.setAllowedHeaders(List.of("Content-Type", "X-XSRF-TOKEN"));
            configuration.setExposedHeaders(List.of("X-XSRF-TOKEN"));
            source.registerCorsConfiguration("/api/**", configuration);
        }
        return source;
    }
}
