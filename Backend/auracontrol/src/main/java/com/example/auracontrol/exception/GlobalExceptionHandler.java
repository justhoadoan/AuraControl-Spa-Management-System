package com.example.auracontrol.exception;


import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;


import java.time.LocalDateTime;


@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                LocalDateTime.now(),
                request.getDescription(false)
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
    }


    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateResourceException(DuplicateResourceException ex, WebRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.CONFLICT.value(),
                ex.getMessage(),
                LocalDateTime.now(),
                request.getDescription(false)
        );
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
    }


    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRequestException(
            InvalidRequestException ex, WebRequest request) {


        ErrorResponse errorResponse = new ErrorResponse(
                HttpStatus.BAD_REQUEST.value(), // 400 Bad Request
                ex.getMessage(),
                LocalDateTime.now(),
                request.getDescription(false)
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }




}

