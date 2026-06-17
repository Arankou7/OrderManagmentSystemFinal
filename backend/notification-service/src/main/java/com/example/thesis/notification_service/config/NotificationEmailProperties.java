package com.example.thesis.notification_service.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "notification.email")
@Getter
@Setter
public class NotificationEmailProperties {

    private boolean enabled = true;
    private boolean htmlEnabled = false;
    private boolean failOnError = false;
    private String from;
    private String replyTo;
    private String subjectTemplate = "Order {orderNumber} received";
    private String textTemplate = """
            Thank you for your order.

            Order number: {orderNumber}
            Customer email: {email}
            """;
    private String htmlTemplate = """
            <p>Thank you for your order.</p>
            <p><strong>Order number:</strong> {orderNumber}</p>
            <p><strong>Customer email:</strong> {email}</p>
            """;
}
