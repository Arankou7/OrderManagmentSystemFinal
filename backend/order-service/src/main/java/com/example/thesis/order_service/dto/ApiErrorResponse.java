package com.example.thesis.order_service.dto;

import java.time.LocalDateTime;

public record ApiErrorResponse(LocalDateTime timestamp,
                               int status,
                               String error,
                               String message,
                               String path,
                               String traceId) {
}
