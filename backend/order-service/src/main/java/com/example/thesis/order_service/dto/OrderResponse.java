package com.example.thesis.order_service.dto;

import com.example.thesis.order_service.model.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrderResponse(UUID orderNumber,
                            String customerEmail,
                            OrderStatus status,
                            LocalDateTime createdAt,
                            LocalDateTime updatedAt,
                            BigDecimal subtotal,
                            BigDecimal total,
                            List<OrderLineItemsResponse> orderLineItems) {
}
