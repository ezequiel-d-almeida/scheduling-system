package com.schedulingsystem.api.service;
import com.schedulingsystem.api.dto.*; import com.schedulingsystem.api.entity.*; import com.schedulingsystem.api.exception.*; import com.schedulingsystem.api.repository.*; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.Transactional; import java.util.*;
@Service public class ScheduleConfigurationService {
 private final AvailabilityWindowRepository windows; private final ScheduleBlockRepository blocks;
 public ScheduleConfigurationService(AvailabilityWindowRepository windows,ScheduleBlockRepository blocks){this.windows=windows;this.blocks=blocks;}
 @Transactional public AvailabilityWindow addWindow(CreateAvailabilityWindowRequest r){if(!r.startTime().isBefore(r.endTime()))throw new IllegalArgumentException("Start time must be before end time");return windows.save(new AvailabilityWindow(r.dayOfWeek(),r.startTime(),r.endTime()));}
 @Transactional public ScheduleBlock addBlock(CreateScheduleBlockRequest r){if(!r.startsAt().isBefore(r.endsAt()))throw new IllegalArgumentException("Start time must be before end time");return blocks.save(new ScheduleBlock(r.startsAt(),r.endsAt(),r.reason()));}
 @Transactional public void removeWindow(Long id){if(!windows.existsById(id))throw new ResourceNotFoundException("Availability window not found");windows.deleteById(id);}
 @Transactional public void removeBlock(Long id){if(!blocks.existsById(id))throw new ResourceNotFoundException("Schedule block not found");blocks.deleteById(id);}
 @Transactional(readOnly=true) public List<AvailabilityWindow> windows(){return windows.findAll();}
 @Transactional(readOnly=true) public List<ScheduleBlock> blocks(){return blocks.findAll();}
}
