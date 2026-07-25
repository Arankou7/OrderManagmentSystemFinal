package com.example.thesis.order_service.service;

import com.example.thesis.order_service.exception.BusinessRuleException;
import com.example.thesis.order_service.model.OrderStatus;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

/** Defines the permitted order-state transitions for the fulfilment workflow. */
@Component
public class OrderStatusWorkflow {
    private static final Map<OrderStatus, List<OrderStatus>> ALLOWED_TRANSITIONS = Map.of(
            OrderStatus.PENDING, List.of(OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.FAILED),
            OrderStatus.CONFIRMED, List.of(OrderStatus.PROCESSING, OrderStatus.CANCELLED),
            OrderStatus.PROCESSING, List.of(OrderStatus.PACKED, OrderStatus.CANCELLED),
            OrderStatus.PACKED, List.of(OrderStatus.SHIPPED),
            OrderStatus.SHIPPED, List.of(OrderStatus.DELIVERED),
            OrderStatus.DELIVERED, List.of(OrderStatus.CANCELLED),
            OrderStatus.CANCELLED, List.of(),
            OrderStatus.FAILED, List.of()
    );

    public List<OrderStatus> allowedNextStatuses(OrderStatus currentStatus) {
        return ALLOWED_TRANSITIONS.getOrDefault(currentStatus, List.of());
    }

    public void validateTransition(OrderStatus currentStatus, OrderStatus requestedStatus) {
        if (!allowedNextStatuses(currentStatus).contains(requestedStatus)) {
            throw new BusinessRuleException("Cannot change an order from " + currentStatus + " to " + requestedStatus + ".");
        }
    }
}
