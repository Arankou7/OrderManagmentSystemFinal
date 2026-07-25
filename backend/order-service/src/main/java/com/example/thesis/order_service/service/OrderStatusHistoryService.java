package com.example.thesis.order_service.service;

import com.example.thesis.order_service.model.Order;
import com.example.thesis.order_service.model.OrderStatus;
import com.example.thesis.order_service.model.OrderStatusHistory;
import com.example.thesis.order_service.repository.OrderStatusHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrderStatusHistoryService {
    private final OrderStatusHistoryRepository historyRepository;

    public OrderStatusHistory record(Order order, OrderStatus previousStatus, OrderStatus status, String changedBy, String note) {
        OrderStatusHistory history = OrderStatusHistory.builder()
                .order(order)
                .previousStatus(previousStatus)
                .status(status)
                .changedAt(LocalDateTime.now())
                .changedBy(changedBy)
                .note(note)
                .build();
        order.getStatusHistory().add(history);
        return historyRepository.save(history);
    }
}
