package com.example.thesis.notification_service.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // 1. Define the Queue Name
    public static final String QUEUE_NAME = "notificationQueue";

    // 2. Define the Exchange Name (The "Post Office" Hub)
    public static final String EXCHANGE_NAME = "orderExchange";

    // 3. Define the Routing Key
    public static final String ROUTING_KEY = "order.placed";

    // Create the Queue
    @Bean
    public Queue notificationQueue() {
        return new Queue(QUEUE_NAME);
    }

    // Create the Exchange
    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // Connect (Bind) the Queue to the Exchange
    @Bean
    public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }
    @Bean
    public MessageConverter messageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
