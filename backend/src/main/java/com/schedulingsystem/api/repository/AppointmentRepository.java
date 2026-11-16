package com.schedulingsystem.api.repository;
import com.schedulingsystem.api.entity.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.domain.Sort;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;
import java.util.*;
public interface AppointmentRepository extends JpaRepository<Appointment,Long>, JpaSpecificationExecutor<Appointment> {
 @EntityGraph(attributePaths = "service") List<Appointment> findAll(Specification<Appointment> specification, Sort sort);
 @Query("select a from Appointment a where a.status in ('PENDING','CONFIRMED') and a.startsAt < :end and a.endsAt > :start and (:excludedId is null or a.id <> :excludedId)") List<Appointment> overlaps(@Param("start") OffsetDateTime start,@Param("end") OffsetDateTime end,@Param("excludedId") Long excludedId);
}
