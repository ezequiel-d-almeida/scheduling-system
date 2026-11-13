package com.schedulingsystem.api.dto;
public record ServiceResponse(Long id, String name, Integer durationMinutes, boolean active) {}
