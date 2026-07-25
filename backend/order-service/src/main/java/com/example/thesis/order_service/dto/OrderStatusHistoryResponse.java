package com.example.thesis.order_service.dto;

import com.example.thesis.order_service.model.OrderStatus;

import java.time.LocalDateTime;

public record OrderStatusHistoryResponse(
        Long id,
        OrderStatus previousStatus,
        OrderStatus status,
        LocalDateTime changedAt,
        String changedBy,
        String note
) { }
