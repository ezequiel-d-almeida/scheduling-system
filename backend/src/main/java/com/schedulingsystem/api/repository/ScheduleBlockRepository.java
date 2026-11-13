package com.schedulingsystem.api.repository;
import com.schedulingsystem.api.entity.ScheduleBlock;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import java.time.OffsetDateTime;
public interface ScheduleBlockRepository extends JpaRepository<ScheduleBlock,Long> { @Query("select count(b)>0 from ScheduleBlock b where b.startsAt < :end and b.endsAt > :start") boolean overlaps(@Param("start") OffsetDateTime start,@Param("end") OffsetDateTime end); }
