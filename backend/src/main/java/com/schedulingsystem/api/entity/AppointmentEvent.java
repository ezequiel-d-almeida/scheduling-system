package com.schedulingsystem.api.entity;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
@Entity @Table(name="appointment_events")
public class AppointmentEvent {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @ManyToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="appointment_id") private Appointment appointment;
 @Column(name="event_type", nullable=false, length=30) private String eventType;
 @Column(name="occurred_at", nullable=false) private OffsetDateTime occurredAt;
 protected AppointmentEvent(){} public AppointmentEvent(Appointment appointment,String eventType){this.appointment=appointment;this.eventType=eventType;this.occurredAt=OffsetDateTime.now();}
 public String getEventType(){return eventType;} public OffsetDateTime getOccurredAt(){return occurredAt;}
}
