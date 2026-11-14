package com.schedulingsystem.api.config;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.security")
public class SecurityProperties {
    private String initialUsername = "";
    private String initialPassword = "";
    private List<String> allowedOrigins = new ArrayList<>();
    private int loginMaxAttempts = 5;
    private Duration loginAttemptWindow = Duration.ofMinutes(15);

    public String getInitialUsername() { return initialUsername; }
    public void setInitialUsername(String initialUsername) { this.initialUsername = initialUsername; }
    public String getInitialPassword() { return initialPassword; }
    public void setInitialPassword(String initialPassword) { this.initialPassword = initialPassword; }
    public List<String> getAllowedOrigins() { return allowedOrigins; }
    public void setAllowedOrigins(List<String> allowedOrigins) { this.allowedOrigins = allowedOrigins; }
    public int getLoginMaxAttempts() { return loginMaxAttempts; }
    public void setLoginMaxAttempts(int loginMaxAttempts) { this.loginMaxAttempts = loginMaxAttempts; }
    public Duration getLoginAttemptWindow() { return loginAttemptWindow; }
    public void setLoginAttemptWindow(Duration loginAttemptWindow) { this.loginAttemptWindow = loginAttemptWindow; }
}
