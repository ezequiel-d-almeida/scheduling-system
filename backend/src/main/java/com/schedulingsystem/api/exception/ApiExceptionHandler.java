package com.schedulingsystem.api.exception;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class) ProblemDetail notFound(ResourceNotFoundException e) { return problem(HttpStatus.NOT_FOUND, e.getMessage()); }
    @ExceptionHandler({ConflictException.class, DataIntegrityViolationException.class}) ProblemDetail conflict(Exception e) { return problem(HttpStatus.CONFLICT, "The requested operation conflicts with an existing reservation or resource state."); }
    @ExceptionHandler({MethodArgumentNotValidException.class, ConstraintViolationException.class, IllegalArgumentException.class}) ProblemDetail invalid(Exception e) { return problem(HttpStatus.BAD_REQUEST, "The request contains invalid data."); }
    private ProblemDetail problem(HttpStatus status, String detail) { return ProblemDetail.forStatusAndDetail(status, detail); }
}
