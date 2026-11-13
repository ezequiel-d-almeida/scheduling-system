package com.schedulingsystem.api.entity;

import jakarta.persistence.*;
import java.time.OffsetDateTime;

@Entity @Table(name = "appointments")
public class Appointment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "service_id") private Service service;
    @Column(name = "client_name", nullable = false, length = 120) private String clientName;
    @Column(name = "client_phone", nullable = false, length = 40) private String clientPhone;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private AppointmentModality modality;
    @Column(length = 200) private String location;
    @Column(name = "starts_at", nullable = false) private OffsetDateTime startsAt;
    @Column(name = "ends_at", nullable = false) private OffsetDateTime endsAt;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private AppointmentStatus status;
    @Column(name = "created_at", nullable = false, updatable = false) private OffsetDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private OffsetDateTime updatedAt;
    protected Appointment() {}
    public Appointment(Service service, String clientName, String clientPhone, AppointmentModality modality, String location, OffsetDateTime startsAt, OffsetDateTime endsAt) { this.service=service; this.clientName=clientName; this.clientPhone=clientPhone; this.modality=modality; this.location=location; this.startsAt=startsAt; this.endsAt=endsAt; this.status=AppointmentStatus.PENDING; this.createdAt=OffsetDateTime.now(); this.updatedAt=this.createdAt; }
    public Long getId(){return id;} public Service getService(){return service;} public String getClientName(){return clientName;} public String getClientPhone(){return clientPhone;} public AppointmentModality getModality(){return modality;} public String getLocation(){return location;} public OffsetDateTime getStartsAt(){return startsAt;} public OffsetDateTime getEndsAt(){return endsAt;} public AppointmentStatus getStatus(){return status;} public OffsetDateTime getCreatedAt(){return createdAt;} public OffsetDateTime getUpdatedAt(){return updatedAt;}
    public void confirm(){ if(status != AppointmentStatus.PENDING) throw new IllegalStateException("Only pending appointments can be confirmed"); status=AppointmentStatus.CONFIRMED; updatedAt=OffsetDateTime.now(); }
    public void cancel(){ if(status == AppointmentStatus.CANCELLED) throw new IllegalStateException("Appointment is already cancelled"); status=AppointmentStatus.CANCELLED; updatedAt=OffsetDateTime.now(); }
    public void reschedule(OffsetDateTime start, OffsetDateTime end){ if(status == AppointmentStatus.CANCELLED) throw new IllegalStateException("Cancelled appointments cannot be rescheduled"); startsAt=start; endsAt=end; updatedAt=OffsetDateTime.now(); }
}
