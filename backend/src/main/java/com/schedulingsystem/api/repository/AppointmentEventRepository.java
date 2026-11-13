package com.schedulingsystem.api.repository;
import com.schedulingsystem.api.entity.AppointmentEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AppointmentEventRepository extends JpaRepository<AppointmentEvent,Long> { List<AppointmentEvent> findByAppointmentIdOrderByOccurredAtAsc(Long appointmentId); }
