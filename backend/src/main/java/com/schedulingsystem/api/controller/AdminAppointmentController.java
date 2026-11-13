package com.schedulingsystem.api.controller;

import com.schedulingsystem.api.dto.*;
import com.schedulingsystem.api.entity.AppointmentStatus;
import com.schedulingsystem.api.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

/** Development-only until authentication is delivered. */
@Profile("dev")
@RestController
@RequestMapping("/api/admin/appointments")
public class AdminAppointmentController {
    private final AppointmentService service;
    public AdminAppointmentController(AppointmentService service) { this.service = service; }
    @GetMapping public List<AppointmentResponse> list(@RequestParam(required=false) LocalDate date, @RequestParam(required=false) AppointmentStatus status) { return service.list(date,status); }
    @GetMapping("/{id}") public AppointmentResponse get(@PathVariable Long id) { return service.get(id); }
    @PostMapping("/{id}/confirm") public AppointmentResponse confirm(@PathVariable Long id) { return service.confirm(id); }
    @PostMapping("/{id}/cancel") public AppointmentResponse cancel(@PathVariable Long id) { return service.cancel(id); }
    @PostMapping("/{id}/reschedule") public AppointmentResponse reschedule(@PathVariable Long id,@Valid @RequestBody RescheduleAppointmentRequest request) { return service.reschedule(id,request); }
    @GetMapping("/{id}/history") public List<AppointmentEventResponse> history(@PathVariable Long id) { return service.history(id); }
}
