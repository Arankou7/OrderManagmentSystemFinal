package com.example.thesis.notification_service;

import com.example.thesis.notification_service.config.NotificationEmailProperties;
import com.example.thesis.notification_service.event.OrderPlacedEvent;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;
    private final NotificationEmailProperties emailProperties;

    @RabbitListener(queues = "notificationQueue")
    public void handleNotification(OrderPlacedEvent orderPlacedEvent) {
        if (!emailProperties.isEnabled()) {
            log.info("Email notification disabled for order {}", orderPlacedEvent.getOrderNumber());
            return;
        }

        try {
            sendOrderPlacedEmail(orderPlacedEvent);
            log.info("Email notification sent for order {} to {}", orderPlacedEvent.getOrderNumber(), orderPlacedEvent.getEmail());
        } catch (MessagingException ex) {
            log.error("Failed to build email notification for order {}", orderPlacedEvent.getOrderNumber(), ex);
            if (emailProperties.isFailOnError()) {
                throw new IllegalStateException("Failed to build email notification", ex);
            }
        } catch (RuntimeException ex) {
            log.error("Failed to send email notification for order {}", orderPlacedEvent.getOrderNumber(), ex);
            if (emailProperties.isFailOnError()) {
                throw ex;
            }
        }
    }

    private void sendOrderPlacedEmail(OrderPlacedEvent orderPlacedEvent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");

        helper.setTo(orderPlacedEvent.getEmail());
        helper.setSubject(render(emailProperties.getSubjectTemplate(), orderPlacedEvent));

        if (StringUtils.hasText(emailProperties.getFrom())) {
            helper.setFrom(emailProperties.getFrom());
        }

        if (StringUtils.hasText(emailProperties.getReplyTo())) {
            helper.setReplyTo(emailProperties.getReplyTo());
        }

        if (emailProperties.isHtmlEnabled()) {
            helper.setText(render(emailProperties.getTextTemplate(), orderPlacedEvent),
                    render(emailProperties.getHtmlTemplate(), orderPlacedEvent));
        } else {
            helper.setText(render(emailProperties.getTextTemplate(), orderPlacedEvent));
        }

        mailSender.send(message);
    }

    private String render(String template, OrderPlacedEvent orderPlacedEvent) {
        return template
                .replace("{orderNumber}", orderPlacedEvent.getOrderNumber().toString())
                .replace("{email}", orderPlacedEvent.getEmail());
    }
}
