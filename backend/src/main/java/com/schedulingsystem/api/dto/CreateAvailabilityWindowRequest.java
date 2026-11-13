package com.schedulingsystem.api.dto;
import jakarta.validation.constraints.*; import java.time.LocalTime;
public record CreateAvailabilityWindowRequest(@NotNull @Min(0) @Max(6) Integer dayOfWeek,@NotNull LocalTime startTime,@NotNull LocalTime endTime) {}
