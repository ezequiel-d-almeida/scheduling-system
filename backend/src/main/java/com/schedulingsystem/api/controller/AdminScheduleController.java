package com.schedulingsystem.api.controller;
import com.schedulingsystem.api.dto.*; import com.schedulingsystem.api.entity.*; import com.schedulingsystem.api.service.ScheduleConfigurationService; import jakarta.validation.Valid; import org.springframework.context.annotation.Profile; import org.springframework.web.bind.annotation.*; import java.util.*;
@Profile("dev") @RestController @RequestMapping("/api/admin/schedule") public class AdminScheduleController {
 private final ScheduleConfigurationService service; public AdminScheduleController(ScheduleConfigurationService service){this.service=service;}
 @GetMapping("/windows") public List<AvailabilityWindow> windows(){return service.windows();}
 @PostMapping("/windows") public AvailabilityWindow addWindow(@Valid @RequestBody CreateAvailabilityWindowRequest request){return service.addWindow(request);}
 @DeleteMapping("/windows/{id}") public void removeWindow(@PathVariable Long id){service.removeWindow(id);}
 @GetMapping("/blocks") public List<ScheduleBlock> blocks(){return service.blocks();}
 @PostMapping("/blocks") public ScheduleBlock addBlock(@Valid @RequestBody CreateScheduleBlockRequest request){return service.addBlock(request);}
 @DeleteMapping("/blocks/{id}") public void removeBlock(@PathVariable Long id){service.removeBlock(id);}
}
