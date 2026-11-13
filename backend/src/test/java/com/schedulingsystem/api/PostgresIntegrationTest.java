package com.schedulingsystem.api;

import com.schedulingsystem.api.dto.*;
import com.schedulingsystem.api.entity.*;
import com.schedulingsystem.api.exception.ConflictException;
import com.schedulingsystem.api.service.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import java.time.*;
import java.util.concurrent.*;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
class PostgresIntegrationTest {
    @Container static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");
    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
    }
    @Autowired ServiceService services;
    @Autowired AppointmentService appointments;
    @Autowired ScheduleConfigurationService schedule;

    private Long serviceId;
    private OffsetDateTime start;
    @BeforeEach void setup() {
        var date = LocalDate.now(ZoneId.of("America/Recife")).plusDays(7 + services.findAll().size());
        schedule.addWindow(new CreateAvailabilityWindowRequest(date.getDayOfWeek().getValue() % 7, LocalTime.of(9,0), LocalTime.of(17,0)));
        serviceId = services.create(new CreateServiceRequest("Integration service", 60)).id();
        start = ZonedDateTime.of(date, LocalTime.of(10,0), ZoneId.of("America/Recife")).toOffsetDateTime();
    }
    private CreateAppointmentRequest request(OffsetDateTime value) { return new CreateAppointmentRequest(serviceId,"Client","+5587999999999",AppointmentModality.REMOTE,null,value); }
    @Test void flywaySchemaAndOverlapConstraintRejectConflictingActiveReservations() {
        appointments.create(request(start));
        assertThrows(ConflictException.class, () -> appointments.create(request(start.plusMinutes(30))));
    }
    @Test void cancellationReleasesIntervalAndConfirmationPreservesIt() {
        var created = appointments.create(request(start));
        var confirmed = appointments.confirm(created.id());
        assertEquals(AppointmentStatus.CONFIRMED, confirmed.status());
        appointments.cancel(created.id());
        assertDoesNotThrow(() -> appointments.create(request(start)));
    }
    @Test void inactiveServiceAndPastStartAreRejected() {
        var inactive = services.create(new CreateServiceRequest("Inactive", 60));
        services.updateStatus(inactive.id(), new UpdateServiceStatusRequest(false));
        assertThrows(ConflictException.class, () -> appointments.create(new CreateAppointmentRequest(inactive.id(),"Client","1",AppointmentModality.REMOTE,null,start)));
        assertThrows(IllegalArgumentException.class, () -> appointments.create(request(OffsetDateTime.now(ZoneId.of("America/Recife")).minusHours(1))));
    }
    @Test void rescheduleExcludesTheCurrentAppointmentFromConflictDetection() {
        var created = appointments.create(request(start));
        var moved = appointments.reschedule(created.id(), new RescheduleAppointmentRequest(start.plusHours(2)));
        assertEquals(start.plusHours(2), moved.startsAt());
    }
    @Test void simultaneousRequestsForTheSameIntervalLeaveOnlyOneReservation() throws Exception {
        var pool = Executors.newFixedThreadPool(2);
        var gate = new CountDownLatch(1);
        try {
            var first = pool.submit(() -> { gate.await(); return attemptCreate(); });
            var second = pool.submit(() -> { gate.await(); return attemptCreate(); });
            gate.countDown();
            assertTrue(first.get() ^ second.get(), "exactly one concurrent request must succeed");
        } finally { pool.shutdownNow(); }
    }
    private boolean attemptCreate() {
        try { appointments.create(request(start)); return true; }
        catch (ConflictException exception) { return false; }
    }
}
