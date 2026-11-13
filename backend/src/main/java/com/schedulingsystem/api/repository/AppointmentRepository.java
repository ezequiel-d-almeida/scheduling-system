package com.schedulingsystem.api.repository;
import com.schedulingsystem.api.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;
import java.util.*;
public interface AppointmentRepository extends JpaRepository<Appointment,Long> {
 @Query("select a from Appointment a join fetch a.service where (:status is null or a.status=:status) and (:from is null or a.startsAt>=:from) and (:to is null or a.startsAt<:to) order by a.startsAt") List<Appointment> search(@Param("status") AppointmentStatus status,@Param("from") OffsetDateTime from,@Param("to") OffsetDateTime to);
 @Query("select a from Appointment a where a.status in ('PENDING','CONFIRMED') and a.startsAt < :end and a.endsAt > :start and (:excludedId is null or a.id <> :excludedId)") List<Appointment> overlaps(@Param("start") OffsetDateTime start,@Param("end") OffsetDateTime end,@Param("excludedId") Long excludedId);
}
