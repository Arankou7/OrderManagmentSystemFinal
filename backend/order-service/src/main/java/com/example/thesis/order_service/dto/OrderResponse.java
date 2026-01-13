package com.example.thesis.order_service.dto;

import com.example.thesis.order_service.model.OrderStatus;

import java.util.List;
import java.util.UUID;

public record OrderResponse(UUID orderNumber,
                            String customerEmail,
                            OrderStatus status,
                            List<OrderLineItemsResponse> orderLineItems) {
}
