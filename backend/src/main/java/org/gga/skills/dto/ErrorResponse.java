package org.gga.skills.dto;

import java.time.LocalDateTime;
import java.util.List;

public record ErrorResponse(
    int status,
    String error,
    String message,
    List<String> details,
    LocalDateTime timestamp
) {
    public ErrorResponse(int status, String error, String message, List<String> details) {
        this(status, error, message, details, LocalDateTime.now());
    }

    public ErrorResponse(int status, String error, String message) {
        this(status, error, message, null, LocalDateTime.now());
    }
}
