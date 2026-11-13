
package com.schedulingsystem.api.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateServiceRequest(

    @NotBlank
    String name,

    @NotNull
    @Min(1)
    Integer durationMinutes

) {}
