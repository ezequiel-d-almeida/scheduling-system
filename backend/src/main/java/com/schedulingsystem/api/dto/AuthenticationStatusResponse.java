package com.schedulingsystem.api.dto;

public record AuthenticationStatusResponse(boolean authenticated, String username) { }
