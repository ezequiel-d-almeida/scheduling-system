package com.schedulingsystem.api.repository;
import com.schedulingsystem.api.entity.AvailabilityWindow;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface AvailabilityWindowRepository extends JpaRepository<AvailabilityWindow,Long> { List<AvailabilityWindow> findByDayOfWeekAndActiveTrue(Integer dayOfWeek); }
