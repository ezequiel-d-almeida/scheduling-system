package com.schedulingsystem.api.service;

import com.schedulingsystem.api.config.SecurityProperties;
import com.schedulingsystem.api.entity.AdminAccount;
import com.schedulingsystem.api.repository.AdminAccountRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class AdminProvisioningService implements ApplicationRunner {
    private static final Logger LOG = LoggerFactory.getLogger(AdminProvisioningService.class);
    private final AdminAccountRepository accounts;
    private final PasswordEncoder passwordEncoder;
    private final SecurityProperties properties;

    public AdminProvisioningService(AdminAccountRepository accounts, PasswordEncoder passwordEncoder, SecurityProperties properties) {
        this.accounts = accounts;
        this.passwordEncoder = passwordEncoder;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (accounts.count() > 0) return;
        var username = properties.getInitialUsername().trim();
        var password = properties.getInitialPassword();
        if (username.isEmpty() || password == null || password.isBlank()) {
            LOG.warn("No administrator account exists. Set ADMIN_USERNAME and ADMIN_PASSWORD to provision one.");
            return;
        }
        if (username.length() > 80 || password.length() > 200) {
            throw new IllegalStateException("Initial administrator credentials do not satisfy configured limits.");
        }
        accounts.save(new AdminAccount(username, passwordEncoder.encode(password)));
        LOG.info("Initial administrator account provisioned.");
    }
}
