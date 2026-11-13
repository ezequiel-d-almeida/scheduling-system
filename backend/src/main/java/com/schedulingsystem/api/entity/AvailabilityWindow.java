package com.schedulingsystem.api.entity;
import jakarta.persistence.*;
import java.time.LocalTime;
@Entity @Table(name="availability_windows")
public class AvailabilityWindow {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="day_of_week", nullable=false) private Integer dayOfWeek;
 @Column(name="start_time", nullable=false) private LocalTime startTime;
 @Column(name="end_time", nullable=false) private LocalTime endTime;
 @Column(nullable=false) private boolean active=true;
 protected AvailabilityWindow(){}
 public AvailabilityWindow(Integer dayOfWeek, LocalTime startTime, LocalTime endTime){this.dayOfWeek=dayOfWeek;this.startTime=startTime;this.endTime=endTime;}
 public Long getId(){return id;}
 public Integer getDayOfWeek(){return dayOfWeek;} public LocalTime getStartTime(){return startTime;} public LocalTime getEndTime(){return endTime;} public boolean isActive(){return active;}
}
