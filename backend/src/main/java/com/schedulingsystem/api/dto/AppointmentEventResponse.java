package com.schedulingsystem.api.dto;
import java.time.OffsetDateTime;
public record AppointmentEventResponse(String eventType, OffsetDateTime occurredAt) {}
