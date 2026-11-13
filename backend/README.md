# Scheduling API

Java 21 / Spring Boot API for appointment requests. PostgreSQL is required; Flyway runs `V1` and `V2` on startup. Set `DB_URL`, `DB_USER`, and `DB_PASSWORD`, then run `./mvnw spring-boot:run` (or `mvnw.cmd spring-boot:run` on Windows).

The public API is `GET /api/public/services`, `GET /api/public/availability?date=YYYY-MM-DD&serviceId=id`, and `POST /api/public/appointments`. Appointment request fields are `serviceId`, `clientName`, `clientPhone`, `modality` (`IN_PERSON` or `REMOTE`), optional `location`, and ISO-8601 `startsAt`.

Availability windows are intentionally not seeded: configure them before accepting public bookings, avoiding an invented professional schedule. Availability uses `America/Recife`, 15-minute search increments, service duration, blocks, and active reservations. PostgreSQL's `appointments_no_active_overlap` exclusion constraint is the final concurrency guard.

Administrative appointment routes are enabled only with `--spring.profiles.active=dev` until authentication is implemented: list/get/confirm/cancel/reschedule/history under `/api/admin/appointments`. Existing service management remains under `/api/services`.

## Tests

`mvnw.cmd test` uses Testcontainers with an isolated PostgreSQL 16 container; it never uses `DB_URL`, local PostgreSQL credentials, or `flyway clean`. Start Docker Desktop before running the suite. The integration tests apply Flyway migrations to the empty container and cover overlap rejection, cancellation release, confirmation, inactive services, past dates, rescheduling, and simultaneous reservation attempts.
