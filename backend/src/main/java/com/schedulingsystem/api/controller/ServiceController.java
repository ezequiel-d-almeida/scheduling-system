
package com.schedulingsystem.api.controller;

import com.schedulingsystem.api.service.ServiceService;

import java.util.List;

import com.schedulingsystem.api.dto.CreateServiceRequest;
import com.schedulingsystem.api.dto.UpdateServiceRequest;
import com.schedulingsystem.api.dto.ServiceResponse;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.*;

import com.schedulingsystem.api.dto.UpdateServiceStatusRequest;

@RestController
@Profile("dev")
@RequestMapping("/api/services")
public class ServiceController {

    private final ServiceService service;

    public ServiceController(ServiceService service) {
        this.service = service;
    }

    @GetMapping
    public List<ServiceResponse> findAll() {
        return service.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceResponse create(
            @Valid @RequestBody CreateServiceRequest request) {

        return service.create(request);
    }

    @GetMapping("/{id}")
    public ServiceResponse findById(
            @PathVariable Long id) {

        return service.findById(id);
    }

    @PutMapping("/{id}")
    public ServiceResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateServiceRequest request) {

        return service.update(id, request);
    }

    @PatchMapping("/{id}/status")
    public ServiceResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateServiceStatusRequest request) {

        return service.updateStatus(id, request);
    }

}
