package com.example.auracontrol.exception;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ErrorResponse {
    private int statusCode;
    private String message;
    private LocalDateTime timestamp;
    private String path;

    public ErrorResponse(int i, String userMessage) {
    }
}
