package com.schedulingsystem.api.dto;
import jakarta.validation.constraints.*; import java.time.OffsetDateTime;
public record CreateScheduleBlockRequest(@NotNull OffsetDateTime startsAt,@NotNull OffsetDateTime endsAt,@Size(max=200) String reason) {}
