package com.schedulingsystem.api.controller;

import com.schedulingsystem.api.dto.AuthenticationStatusResponse;
import com.schedulingsystem.api.dto.CsrfTokenResponse;
import com.schedulingsystem.api.dto.LoginRequest;
import com.schedulingsystem.api.service.LoginAttemptService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.authentication.session.ChangeSessionIdAuthenticationStrategy;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthenticationController {
    private static final String GENERIC_FAILURE = "Invalid username or password.";
    private final AuthenticationManager authenticationManager;
    private final LoginAttemptService attempts;
    private final HttpSessionSecurityContextRepository securityContexts = new HttpSessionSecurityContextRepository();
    private final ChangeSessionIdAuthenticationStrategy sessionStrategy = new ChangeSessionIdAuthenticationStrategy();

    public AuthenticationController(AuthenticationManager authenticationManager, LoginAttemptService attempts) {
        this.authenticationManager = authenticationManager;
        this.attempts = attempts;
    }

    @GetMapping("/csrf")
    public CsrfTokenResponse csrf(CsrfToken token) { return new CsrfTokenResponse(token.getHeaderName(), token.getToken()); }

    @PostMapping("/login")
    public AuthenticationStatusResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest, HttpServletResponse httpResponse) {
        var key = request.username().trim().toLowerCase() + "|" + clientAddress(httpRequest);
        if (attempts.isBlocked(key)) throw new BadCredentialsException(GENERIC_FAILURE);
        try {
            Authentication authentication = authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(request.username().trim(), request.password()));
            sessionStrategy.onAuthentication(authentication, httpRequest, httpResponse);
            var context = new SecurityContextImpl(authentication);
            SecurityContextHolder.setContext(context);
            securityContexts.saveContext(context, httpRequest, httpResponse);
            attempts.succeeded(key);
            return new AuthenticationStatusResponse(true, authentication.getName());
        } catch (org.springframework.security.core.AuthenticationException exception) {
            attempts.failed(key);
            throw new BadCredentialsException(GENERIC_FAILURE);
        }
    }

    @GetMapping("/me")
    public AuthenticationStatusResponse me(Authentication authentication) {
        return authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())
                ? new AuthenticationStatusResponse(false, null)
                : new AuthenticationStatusResponse(true, authentication.getName());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
    }

    private String clientAddress(HttpServletRequest request) {
        return request.getRemoteAddr() == null ? "unknown" : request.getRemoteAddr();
    }
}
