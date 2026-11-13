package com.schedulingsystem.api.entity;
import jakarta.persistence.*;
import java.time.OffsetDateTime;
@Entity @Table(name="schedule_blocks")
public class ScheduleBlock {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="starts_at", nullable=false) private OffsetDateTime startsAt;
 @Column(name="ends_at", nullable=false) private OffsetDateTime endsAt;
 @Column(length=200) private String reason;
 protected ScheduleBlock(){}
 public ScheduleBlock(OffsetDateTime startsAt, OffsetDateTime endsAt, String reason){this.startsAt=startsAt;this.endsAt=endsAt;this.reason=reason;}
 public Long getId(){return id;} public String getReason(){return reason;}
 public OffsetDateTime getStartsAt(){return startsAt;} public OffsetDateTime getEndsAt(){return endsAt;}
}
