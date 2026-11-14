package com.schedulingsystem.api.service;

import com.schedulingsystem.api.config.SecurityProperties;
import java.time.Clock;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;

@Service
public class LoginAttemptService {
    private final ConcurrentHashMap<String, Attempt> attempts = new ConcurrentHashMap<>();
    private final SecurityProperties properties;
    private final Clock clock = Clock.systemUTC();

    public LoginAttemptService(SecurityProperties properties) { this.properties = properties; }

    public boolean isBlocked(String key) {
        var attempt = attempts.get(key);
        return attempt != null && attempt.blockedUntil().isAfter(clock.instant());
    }

    public void failed(String key) {
        attempts.compute(key, (ignored, current) -> {
            var now = clock.instant();
            var failures = current == null || current.windowStarted().plus(properties.getLoginAttemptWindow()).isBefore(now) ? 1 : current.failures() + 1;
            var started = current == null || current.windowStarted().plus(properties.getLoginAttemptWindow()).isBefore(now) ? now : current.windowStarted();
            var blockedUntil = failures >= properties.getLoginMaxAttempts() ? now.plus(properties.getLoginAttemptWindow()) : Instant.EPOCH;
            return new Attempt(failures, started, blockedUntil);
        });
    }

    public void succeeded(String key) { attempts.remove(key); }

    private record Attempt(int failures, Instant windowStarted, Instant blockedUntil) { }
}
