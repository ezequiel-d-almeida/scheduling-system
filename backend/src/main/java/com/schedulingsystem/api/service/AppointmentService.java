package com.schedulingsystem.api.service;

import com.schedulingsystem.api.dto.*;
import com.schedulingsystem.api.entity.*;
import com.schedulingsystem.api.exception.*;
import com.schedulingsystem.api.repository.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;

@Service
public class AppointmentService {
    private static final ZoneId BUSINESS_ZONE = ZoneId.of("America/Recife");
    private final AppointmentRepository appointments; private final AppointmentEventRepository events; private final AvailabilityWindowRepository windows; private final ScheduleBlockRepository blocks; private final ServiceService services;
    public AppointmentService(AppointmentRepository appointments, AppointmentEventRepository events, AvailabilityWindowRepository windows, ScheduleBlockRepository blocks, ServiceService services) { this.appointments=appointments; this.events=events; this.windows=windows; this.blocks=blocks; this.services=services; }
    @Transactional(readOnly=true) public AvailabilityResponse availability(LocalDate date, Long serviceId) { var service=services.findActiveEntity(serviceId); var slots=new ArrayList<OffsetDateTime>(); for (var window : windows.findByDayOfWeekAndActiveTrue(date.getDayOfWeek().getValue()%7)) { var current=ZonedDateTime.of(date,window.getStartTime(),BUSINESS_ZONE); var limit=ZonedDateTime.of(date,window.getEndTime(),BUSINESS_ZONE); while(!current.plusMinutes(service.getDurationMinutes()).isAfter(limit)){var start=current.toOffsetDateTime();var end=current.plusMinutes(service.getDurationMinutes()).toOffsetDateTime();if(!start.isBefore(OffsetDateTime.now(BUSINESS_ZONE))&&appointments.overlaps(start,end,null).isEmpty()&&!blocks.overlaps(start,end))slots.add(start);current=current.plusMinutes(15);}} return new AvailabilityResponse(serviceId,date.toString(),slots); }
    @Transactional public AppointmentResponse create(CreateAppointmentRequest request) { var service=services.findActiveEntity(request.serviceId()); var start=request.startsAt().atZoneSameInstant(BUSINESS_ZONE).toOffsetDateTime(); var end=start.plusMinutes(service.getDurationMinutes()); validateSlot(start,end,null); try {var appointment=appointments.saveAndFlush(new Appointment(service,request.clientName().trim(),request.clientPhone().trim(),request.modality(),request.location(),start,end));events.save(new AppointmentEvent(appointment,"CREATED"));return response(appointment);} catch(DataIntegrityViolationException e){throw new ConflictException("The selected time is no longer available");} }
    @Transactional(readOnly=true) public List<AppointmentResponse> list(LocalDate date,AppointmentStatus status){OffsetDateTime from=date==null?null:date.atStartOfDay(BUSINESS_ZONE).toOffsetDateTime();OffsetDateTime to=date==null?null:date.plusDays(1).atStartOfDay(BUSINESS_ZONE).toOffsetDateTime();return appointments.search(status,from,to).stream().map(this::response).toList();}
    @Transactional(readOnly=true) public AppointmentResponse get(Long id){return response(entity(id));}
    @Transactional public AppointmentResponse confirm(Long id){var a=entity(id);a.confirm();events.save(new AppointmentEvent(a,"CONFIRMED"));return response(a);}
    @Transactional public AppointmentResponse cancel(Long id){var a=entity(id);a.cancel();events.save(new AppointmentEvent(a,"CANCELLED"));return response(a);}
    @Transactional public AppointmentResponse reschedule(Long id,RescheduleAppointmentRequest request){var a=entity(id);var start=request.startsAt().atZoneSameInstant(BUSINESS_ZONE).toOffsetDateTime();var end=start.plusMinutes(a.getService().getDurationMinutes());validateSlot(start,end,a.getId());try{a.reschedule(start,end);appointments.flush();events.save(new AppointmentEvent(a,"RESCHEDULED"));return response(a);}catch(DataIntegrityViolationException e){throw new ConflictException("The selected time is no longer available");}}
    @Transactional(readOnly=true) public List<AppointmentEventResponse> history(Long id){entity(id);return events.findByAppointmentIdOrderByOccurredAtAsc(id).stream().map(e->new AppointmentEventResponse(e.getEventType(),e.getOccurredAt())).toList();}
    private Appointment entity(Long id){return appointments.findById(id).orElseThrow(()->new ResourceNotFoundException("Appointment not found"));}
    private void validateSlot(OffsetDateTime start,OffsetDateTime end,Long excludedId){if(!start.isAfter(OffsetDateTime.now(BUSINESS_ZONE)))throw new IllegalArgumentException("Appointments must be in the future");LocalDate date=start.atZoneSameInstant(BUSINESS_ZONE).toLocalDate();boolean inside=windows.findByDayOfWeekAndActiveTrue(date.getDayOfWeek().getValue()%7).stream().anyMatch(w->!start.toLocalTime().isBefore(w.getStartTime())&&!end.toLocalTime().isAfter(w.getEndTime()));if(!inside)throw new ConflictException("The selected time is outside configured availability");if(blocks.overlaps(start,end)||!appointments.overlaps(start,end,excludedId).isEmpty())throw new ConflictException("The selected time is no longer available");}
    private AppointmentResponse response(Appointment a){return new AppointmentResponse(a.getId(),a.getService().getId(),a.getService().getName(),a.getClientName(),a.getClientPhone(),a.getModality(),a.getLocation(),a.getStartsAt(),a.getEndsAt(),a.getStatus(),a.getCreatedAt(),a.getUpdatedAt());}
}
