package com.example.thesis.notification_service;

import com.example.thesis.notification_service.event.OrderPlacedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class NotificationService {

    // This name must match the QUEUE_NAME in your RabbitMQConfig
    @RabbitListener(queues = "notificationQueue")
    public void handleNotification(OrderPlacedEvent orderPlacedEvent) {
        log.info("---------------------------------");
        log.info("RECEIVED NEW NOTIFICATION!");
        log.info("Order Number: {}", orderPlacedEvent.getOrderNumber());
        log.info("Emailing to:  {}", orderPlacedEvent.getEmail());
        log.info("---------------------------------");
    }
}