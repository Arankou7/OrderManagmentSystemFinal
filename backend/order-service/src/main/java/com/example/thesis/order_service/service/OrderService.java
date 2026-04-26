package com.example.thesis.order_service.service;

import com.example.thesis.order_service.client.CartClient;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
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
    private final CartClient cartClient;

    @CircuitBreaker(name = "inventory", fallbackMethod = "fallback")
    public OrderResponse placeOrder(OrderRequest orderRequest, String authHeader) {

        CartResponse cart = cartClient.getCart(authHeader);

        if (cart == null || cart.items() == null || cart.items().isEmpty()) {
            throw new RuntimeException("Cannot place order. Cart is empty!");
        }

        // Extract the customer email from the JWT token
        String customerEmail = extractEmailFromJwt();
        if (customerEmail == null || customerEmail.isEmpty()) {
            throw new RuntimeException("Cannot extract customer email from token!");
        }

        // 1. Calculate the reservation ID that the Cart MS used
        // Assuming cart.id() returns the User ID string!
        UUID cartReservationId = UUID.nameUUIDFromBytes(cart.id().getBytes());

        // 2. CONFIRM the reservation in the Inventory MS
        // This will permanently deduct the totalQuantity and delete the temporary reservation
        inventoryClient.confirmReservation(authHeader, cartReservationId);

        // 3. Create the actual Order with a fresh, final Order Number
        Order order = Order.builder()
                .orderNumber(UUID.randomUUID())
                .customerEmail(customerEmail)
                .status(OrderStatus.PENDING) // Or COMPLETED, up to you!
                .build();

        List<OrderLineItems> orderLineItems = cart.items()
                .stream()
                .map(cartItem -> {
                    OrderLineItems lineItem = new OrderLineItems();
                    lineItem.setSkuCode(cartItem.skuCode());
                    lineItem.setPrice(cartItem.price());
                    lineItem.setQuantity(cartItem.quantity());
                    lineItem.setProductName(cartItem.productName());
                    lineItem.setOrder(order);
                    return lineItem;
                })
                .toList();

        order.setOrderLineItems(orderLineItems);
        orderRepository.save(order);

        // 4. Clear the cart
        // Note: This tells Cart MS to "release" the reservation, but since we already
        // "confirmed" and deleted it above, the release will safely do nothing!
        cartClient.clearCart(authHeader);

        // 5. Send RabbitMQ Notification
        OrderPlacedEvent event = new OrderPlacedEvent(order.getOrderNumber(), order.getCustomerEmail());
        rabbitTemplate.convertAndSend("orderExchange", "order.placed", event);

        log.info("Notification sent for order {}", order.getOrderNumber());
        log.info("Order {} placed successfully", order.getOrderNumber());

        return mapToOrderResponse(order);
    }


    private String extractEmailFromJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof Jwt)) {
            return null;
        }

        Jwt jwt = (Jwt) authentication.getPrincipal();

        String email = jwt.getClaimAsString("email");
        if (email != null && !email.isEmpty()) {
            return email;
        }
        
        String username = jwt.getClaimAsString("preferred_username");
        if (username != null && !username.isEmpty()) {
            return username;
        }
        
        return jwt.getSubject();
    }

    public OrderResponse fallback(OrderRequest orderRequest, String authHeader, Throwable throwable) {
        log.error("Circuit breaker triggered: {}", throwable.getMessage());
        throw new RuntimeException("Oops! Something went wrong, please try again later.");
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