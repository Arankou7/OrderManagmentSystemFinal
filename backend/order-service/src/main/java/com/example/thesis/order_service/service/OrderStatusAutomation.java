package com.example.thesis.order_service.service;

import com.example.thesis.order_service.model.Order;
import com.example.thesis.order_service.model.OrderStatus;
import com.example.thesis.order_service.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty(prefix = "orders.status-automation", name = "enabled", havingValue = "true", matchIfMissing = true)
public class OrderStatusAutomation {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryService orderStatusHistoryService;

    @Value("${orders.status-automation.finish-after-seconds:30}")
    private long finishAfterSeconds;

    @Scheduled(
            fixedDelayString = "${orders.status-automation.fixed-delay-ms:10000}",
            initialDelayString = "${orders.status-automation.initial-delay-ms:10000}"
    )
    @Transactional
    public void finishPendingOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusSeconds(finishAfterSeconds);
        List<Order> pendingOrders = orderRepository.findByStatusAndCreatedAtBefore(OrderStatus.PENDING, cutoff);

        if (pendingOrders.isEmpty()) {
            return;
        }

        pendingOrders.forEach(order -> {
            order.setStatus(OrderStatus.DELIVERED);
            order.setDeliveredAt(LocalDateTime.now());
            orderStatusHistoryService.record(order, OrderStatus.PENDING, OrderStatus.DELIVERED, "SYSTEM", "Automatically advanced by demo status automation");
        });
        orderRepository.saveAll(pendingOrders);

        log.info("Automatically marked {} pending orders as delivered", pendingOrders.size());
    }
}
