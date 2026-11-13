package com.schedulingsystem.api.dto;
import java.time.OffsetDateTime;
import java.util.List;
public record AvailabilityResponse(Long serviceId, String date, List<OffsetDateTime> availableStarts) {}
