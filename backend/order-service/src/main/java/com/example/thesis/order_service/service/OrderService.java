package com.example.thesis.order_service.service;

import com.example.thesis.order_service.client.InventoryClient;
import com.example.thesis.order_service.client.ProductClient;
import com.example.thesis.order_service.dto.*;
import com.example.thesis.order_service.event.OrderPlacedEvent;
import com.example.thesis.order_service.model.Order;
import com.example.thesis.order_service.model.OrderLineItems;
import com.example.thesis.order_service.model.OrderStatus;
import com.example.thesis.order_service.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final ProductClient productClient;
    private final RabbitTemplate rabbitTemplate;

    @CircuitBreaker(name = "inventory",fallbackMethod = "fallback")
    public OrderResponse placeOrder(OrderRequest orderRequest) {

        List<InventoryCheckItem> inventoryItems = orderRequest.orderLineItems()
                .stream()
                .map(item -> new InventoryCheckItem(item.skuCode(), item.quantity()))
                .toList();

        InventoryCheckRequest checkRequest = new InventoryCheckRequest(inventoryItems);

        InventoryCheckResponse response = inventoryClient.checkInventory(checkRequest);

        boolean allProductsInStock = inventoryItems.stream()
                .allMatch(item -> response.availability().getOrDefault(item.skuCode(), false));

        if (!allProductsInStock) {
            throw new RuntimeException("One or more products are not in stock, order failed.");
        }

        Order order = Order.builder()
                .orderNumber(UUID.randomUUID())
                .customerEmail(orderRequest.customerEmail())
                .status(OrderStatus.PENDING)
                .build();

        List<OrderLineItems> orderLineItems = orderRequest.orderLineItems()
                .stream()
                .map(this::mapToEntity)
                .toList();

        orderLineItems.forEach(item -> item.setOrder(order));
        order.setOrderLineItems(orderLineItems);

        orderRepository.save(order);

        OrderPlacedEvent event = new OrderPlacedEvent(order.getOrderNumber(), order.getCustomerEmail());

        rabbitTemplate.convertAndSend("orderExchange", "order.placed", event);

        log.info("Notification sent for order {}", order.getOrderNumber());

        log.info("Order {} placed successfully", order.getOrderNumber());
        return mapToOrderResponse(order);
    }

    private OrderResponse fallback(OrderRequest orderRequest, Throwable runtimeException) {
        System.out.println("Cannot Place Order. Executing Fallback logic. Error: " + runtimeException.getMessage());
        return new OrderResponse(null, "Oops! Inventory service is down. Please try again later.", null, null);
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderLineItemsResponse> orderLineItemsResponses = order.getOrderLineItems()
                .stream()
                .map(item -> new OrderLineItemsResponse(item.getId(), item.getSkuCode(), item.getPrice(), item.getQuantity()))
                .toList();

        return new OrderResponse(order.getOrderNumber(), order.getCustomerEmail(), order.getStatus(), orderLineItemsResponses);
    }

    private OrderLineItems mapToEntity(OrderLineItemsRequest request) {
        ProductResponse product = productClient.getProductBySku(request.skuCode());

        OrderLineItems lineItems = new OrderLineItems();
        lineItems.setSkuCode(request.skuCode());
        lineItems.setQuantity(request.quantity());

        lineItems.setPrice(product.price());
        lineItems.setProductName(product.name());

        return lineItems;
    }

    public List<OrderResponse> getOrders() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    public OrderResponse getOrderByNumber(UUID orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found with number: " + orderNumber));
        return mapToOrderResponse(order);
    }

    public OrderResponse updateOrderStatus(UUID orderNumber, OrderStatus newStatus) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found with number: " + orderNumber));

        order.setStatus(newStatus);
        orderRepository.save(order);
        return mapToOrderResponse(order);
    }

    public List<OrderResponse> getOrdersByCustomer(String email) {
        List<Order> orders = orderRepository.findByCustomerEmail(email);
        return orders.stream()
                .map(this::mapToOrderResponse)
                .toList();
    }
}