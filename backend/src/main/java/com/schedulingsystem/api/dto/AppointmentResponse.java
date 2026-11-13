package com.schedulingsystem.api.dto;
import com.schedulingsystem.api.entity.*;
import java.time.OffsetDateTime;
public record AppointmentResponse(Long id, Long serviceId, String serviceName, String clientName, String clientPhone, AppointmentModality modality, String location, OffsetDateTime startsAt, OffsetDateTime endsAt, AppointmentStatus status, OffsetDateTime createdAt, OffsetDateTime updatedAt) {}
