
package com.schedulingsystem.api.service;

import com.schedulingsystem.api.repository.ServiceRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.schedulingsystem.api.dto.ServiceResponse;
import com.schedulingsystem.api.exception.ResourceNotFoundException;
import com.schedulingsystem.api.exception.ConflictException;

import com.schedulingsystem.api.dto.CreateServiceRequest;
import com.schedulingsystem.api.dto.UpdateServiceRequest;
import com.schedulingsystem.api.dto.UpdateServiceStatusRequest;

import java.util.List;


@Service
public class ServiceService {

    private final ServiceRepository repository;

    public ServiceService(ServiceRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public ServiceResponse create(
            CreateServiceRequest request) {

        var service = new com.schedulingsystem.api.entity.Service(
            request.name(),
            request.durationMinutes()
        );

        return toResponse(repository.save(service));
    }

    @Transactional(readOnly = true)
    public ServiceResponse findById(Long id) {
        return toResponse(findEntity(id));
    }

    @Transactional
    public ServiceResponse update(
            Long id,
            UpdateServiceRequest request) {

        var service = findEntity(id);

        service.update(
            request.name(),
            request.durationMinutes()
        );

        return toResponse(repository.save(service));
    }

    @Transactional
    public ServiceResponse updateStatus(
            Long id,
            UpdateServiceStatusRequest request) {

        var service = findEntity(id);

        if (request.active()) {
            service.activate();
        } else {
            service.deactivate();
        }

        return toResponse(service);
    }

    @Transactional(readOnly = true)
    public List<ServiceResponse> findActive() { return repository.findByActiveTrue().stream().map(this::toResponse).toList(); }

    @Transactional(readOnly = true)
    public com.schedulingsystem.api.entity.Service findActiveEntity(Long id) {
        var service = findEntity(id);
        if (!service.getActive()) throw new ConflictException("Service is inactive");
        return service;
    }

    private com.schedulingsystem.api.entity.Service findEntity(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Service not found"));
    }
    private ServiceResponse toResponse(com.schedulingsystem.api.entity.Service service) {
        return new ServiceResponse(service.getId(), service.getName(), service.getDurationMinutes(), service.getActive());
    }

}
