package com.schedulingsystem.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.schedulingsystem.api.repository.AdminAccountRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
class SecurityIntegrationTest {
    private static final String USERNAME = "security-admin";
    private static final String PASSWORD = "test-only-strong-password";

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("app.security.initial-username", () -> USERNAME);
        registry.add("app.security.initial-password", () -> PASSWORD);
        registry.add("server.servlet.session.cookie.secure", () -> false);
    }

    @Autowired MockMvc mvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired AdminAccountRepository accounts;
    @Autowired PasswordEncoder passwordEncoder;

    @Test
    void administrativeRoutesRequireAnAuthenticatedSession() throws Exception {
        mvc.perform(get("/api/services")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/appointments")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/admin/schedule/windows")).andExpect(status().isUnauthorized());
    }

    @Test
    void publicRoutesRemainAccessibleWithoutAuthentication() throws Exception {
        mvc.perform(get("/api/public/services")).andExpect(status().isOk());
        mvc.perform(post("/api/public/appointments").contentType(APPLICATION_JSON).content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void validLoginCreatesSessionAndInvalidLoginUsesGenericError() throws Exception {
        var csrf = csrf();
        mvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .cookie(csrf.cookie())
                        .header("X-XSRF-TOKEN", csrf.token())
                        .content("{\"username\":\"" + USERNAME + "\",\"password\":\"wrong\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail", is("Invalid username or password.")));

        var login = login(csrf);
        mvc.perform(get("/api/auth/me").session(login.session()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.authenticated", is(true)))
                .andExpect(jsonPath("$.username", is(USERNAME)));
        mvc.perform(get("/api/services").session(login.session())).andExpect(status().isOk());
    }

    @Test
    void csrfProtectsAuthenticatedAdministrativeChanges() throws Exception {
        var csrf = csrf();
        var login = login(csrf);
        var body = "{\"name\":\"Security test service\",\"durationMinutes\":50}";

        mvc.perform(post("/api/services").session(login.session()).contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/services").session(login.session()).cookie(csrf.cookie())
                        .header("X-XSRF-TOKEN", csrf.token()).contentType(APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }

    @Test
    void logoutInvalidatesTheAdministrativeSession() throws Exception {
        var csrf = csrf();
        var login = login(csrf);
        mvc.perform(post("/api/auth/logout").session(login.session()).cookie(csrf.cookie()).header("X-XSRF-TOKEN", csrf.token()))
                .andExpect(status().isNoContent());
        mvc.perform(get("/api/services").session(login.session())).andExpect(status().isUnauthorized());
    }

    @Test
    void provisionedPasswordIsOnlyStoredAsBcryptHash() {
        var account = accounts.findByUsername(USERNAME).orElseThrow();
        assertNotEquals(PASSWORD, account.getPasswordHash());
        assertTrue(account.getPasswordHash().startsWith("$2"));
        assertTrue(passwordEncoder.matches(PASSWORD, account.getPasswordHash()));
    }

    private LoginSession login(Csrf csrf) throws Exception {
        MvcResult result = mvc.perform(post("/api/auth/login")
                        .contentType(APPLICATION_JSON)
                        .cookie(csrf.cookie())
                        .header("X-XSRF-TOKEN", csrf.token())
                        .content("{\"username\":\"" + USERNAME + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn();
        return new LoginSession((MockHttpSession) result.getRequest().getSession(false));
    }

    private Csrf csrf() throws Exception {
        MvcResult result = mvc.perform(get("/api/auth/csrf")).andExpect(status().isOk()).andReturn();
        String token = objectMapper.readTree(result.getResponse().getContentAsByteArray()).get("token").asText();
        return new Csrf(token, result.getResponse().getCookie("XSRF-TOKEN"));
    }

    private record Csrf(String token, jakarta.servlet.http.Cookie cookie) { }
    private record LoginSession(MockHttpSession session) { }
}
