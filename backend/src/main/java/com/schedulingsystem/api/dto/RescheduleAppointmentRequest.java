package com.schedulingsystem.api.dto;
import jakarta.validation.constraints.NotNull;
import java.time.OffsetDateTime;
public record RescheduleAppointmentRequest(@NotNull OffsetDateTime startsAt) {}
