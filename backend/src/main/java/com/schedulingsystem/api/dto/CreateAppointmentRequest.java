package com.schedulingsystem.api.dto;
import com.schedulingsystem.api.entity.AppointmentModality;
import jakarta.validation.constraints.*;
import java.time.OffsetDateTime;
public record CreateAppointmentRequest(@NotNull Long serviceId, @NotBlank @Size(max=120) String clientName, @NotBlank @Size(max=40) String clientPhone, @NotNull AppointmentModality modality, @Size(max=200) String location, @NotNull OffsetDateTime startsAt) {}
