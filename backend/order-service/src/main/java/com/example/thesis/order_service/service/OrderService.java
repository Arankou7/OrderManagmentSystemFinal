package com.example.thesis.order_service.service;

import com.example.thesis.order_service.client.CartClient;
import com.example.thesis.order_service.client.InventoryClient;
import com.example.thesis.order_service.client.ProductClient;
import com.example.thesis.order_service.dto.*;
import com.example.thesis.order_service.event.OrderPlacedEvent;
import com.example.thesis.order_service.exception.BusinessRuleException;
import com.example.thesis.order_service.exception.OrderNotFoundException;
import com.example.thesis.order_service.exception.ServiceUnavailableException;
import com.example.thesis.order_service.model.Order;
import com.example.thesis.order_service.model.OrderLineItems;
import com.example.thesis.order_service.model.OrderStatus;
import com.example.thesis.order_service.repository.OrderRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {
    private static final int DELIVERED_CANCELLATION_WINDOW_DAYS = 14;

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final ProductClient productClient;
    private final RabbitTemplate rabbitTemplate;
    private final CartClient cartClient;
    private final OrderStatusHistoryService orderStatusHistoryService;
    private final OrderStatusWorkflow orderStatusWorkflow;

    @CircuitBreaker(name = "inventory", fallbackMethod = "fallback")
    @Transactional
    public OrderResponse placeOrder(OrderRequest orderRequest, String authHeader, String idempotencyKey) {
        String customerEmail = extractEmailFromJwt();
        if (customerEmail == null || customerEmail.isEmpty()) {
            throw new BusinessRuleException("Cannot extract customer email from token!");
        }

        String normalizedIdempotencyKey = normalizeIdempotencyKey(idempotencyKey);
        if (normalizedIdempotencyKey != null) {
            var existingOrder = orderRepository.findByCustomerEmailAndIdempotencyKey(customerEmail, normalizedIdempotencyKey);
            if (existingOrder.isPresent()) {
                log.info("Returning existing order for idempotency key {}", normalizedIdempotencyKey);
                return mapToOrderResponse(existingOrder.get());
            }
        }

        CartResponse cart = cartClient.getCart(authHeader);

        if (cart == null || cart.items() == null || cart.items().isEmpty()) {
            throw new BusinessRuleException("Cannot place order. Cart is empty!");
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
                .idempotencyKey(normalizedIdempotencyKey)
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
        Order savedOrder = orderRepository.save(order);
        orderStatusHistoryService.record(savedOrder, null, OrderStatus.PENDING, customerEmail, "Order placed");

        // 4. Clear the cart
        // Note: This tells Cart MS to "release" the reservation, but since we already
        // "confirmed" and deleted it above, the release will safely do nothing!
        cartClient.clearCart(authHeader);

        // 5. Send RabbitMQ Notification
        OrderPlacedEvent event = new OrderPlacedEvent(order.getOrderNumber(), order.getCustomerEmail());
        rabbitTemplate.convertAndSend("orderExchange", "order.placed", event);

        log.info("Notification sent for order {}", order.getOrderNumber());
        log.info("Order {} placed successfully", order.getOrderNumber());

        return mapToOrderResponse(savedOrder);
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

    public OrderResponse fallback(OrderRequest orderRequest, String authHeader, String idempotencyKey, Throwable throwable) {
        log.error("Circuit breaker triggered: {}", throwable.getMessage());
        throw new ServiceUnavailableException("Order placement is temporarily unavailable. Please try again later.");
    }

    private OrderResponse mapToOrderResponse(Order order) {
        List<OrderLineItemsResponse> orderLineItemsResponses = order.getOrderLineItems()
                .stream()
                .map(item -> new OrderLineItemsResponse(
                        item.getId(),
                        item.getSkuCode(),
                        item.getProductName(),
                        item.getPrice(),
                        item.getQuantity(),
                        calculateLineTotal(item)
                ))
                .toList();

        BigDecimal subtotal = calculateSubtotal(order);
        List<OrderStatusHistoryResponse> statusHistory = order.getStatusHistory().stream()
                .map(entry -> new OrderStatusHistoryResponse(
                        entry.getId(), entry.getPreviousStatus(), entry.getStatus(), entry.getChangedAt(), entry.getChangedBy(), entry.getNote()
                ))
                .toList();
        if (statusHistory.isEmpty()) {
            statusHistory = inferredLegacyHistory(order);
        }

        LocalDateTime deliveredAt = deliveredAt(order);
        boolean cancellationEligible = isCustomerCancellationEligible(order, deliveredAt);
        List<OrderStatus> allowedNextStatuses = orderStatusWorkflow.allowedNextStatuses(order.getStatus()).stream()
                .filter(status -> status != OrderStatus.CANCELLED || cancellationEligible || order.getStatus() != OrderStatus.DELIVERED)
                .toList();

        return new OrderResponse(
                order.getOrderNumber(),
                order.getCustomerEmail(),
                order.getStatus(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                subtotal,
                subtotal,
                orderLineItemsResponses,
                statusHistory,
                allowedNextStatuses,
                cancellationEligible,
                deliveredAt == null ? null : deliveredAt.plusDays(DELIVERED_CANCELLATION_WINDOW_DAYS)
        );
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

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders() {
        List<Order> orders = orderRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
        return orders.stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByNumber(UUID orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with number: " + orderNumber));
        return mapToOrderResponse(order);
    }

    @Transactional
    public OrderResponse updateOrderStatus(UUID orderNumber, OrderStatus newStatus) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with number: " + orderNumber));

        if (order.getStatus() == newStatus) {
            return mapToOrderResponse(order);
        }
        OrderStatus previousStatus = order.getStatus();
        orderStatusWorkflow.validateTransition(previousStatus, newStatus);
        if (previousStatus == OrderStatus.DELIVERED && newStatus == OrderStatus.CANCELLED && !isCancellationEligible(order, deliveredAt(order))) {
            throw new BusinessRuleException("Delivered orders can only be cancelled within 14 days of delivery.");
        }
        order.setStatus(newStatus);
        if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        }
        Order updatedOrder = orderRepository.save(order);
        String changedBy = extractEmailFromJwt();
        orderStatusHistoryService.record(updatedOrder, previousStatus, newStatus,
                changedBy == null || changedBy.isBlank() ? "Administrator" : changedBy,
                "Status updated by administrator");
        return mapToOrderResponse(updatedOrder);
    }

    /** Customers may cancel before packing, or after delivery during the 14-day withdrawal window. */
    @Transactional
    public OrderResponse cancelDeliveredOrder(UUID orderNumber) {
        Order order = orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new OrderNotFoundException("Order not found with number: " + orderNumber));
        String requester = extractEmailFromJwt();
        if (requester == null || requester.isBlank()) {
            throw new BusinessRuleException("Cannot identify the current user.");
        }
        if (!isAdministrator() && !order.getCustomerEmail().equalsIgnoreCase(requester)) {
            throw new BusinessRuleException("You can only cancel your own orders.");
        }
        OrderStatus previousStatus = order.getStatus();
        if (!isCustomerCancellationEligible(order, deliveredAt(order))) {
            throw new BusinessRuleException("This order can no longer be cancelled. Orders may be cancelled before packing, or within 14 days after delivery.");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order updatedOrder = orderRepository.save(order);
        String actor = isAdministrator() ? "Backoffice: " + requester : "Customer: " + requester;
        String note = previousStatus == OrderStatus.DELIVERED
                ? "Cancelled within the 14-day delivered-order cancellation period"
                : "Cancelled before warehouse packing";
        orderStatusHistoryService.record(updatedOrder, previousStatus, OrderStatus.CANCELLED, actor, note);
        return mapToOrderResponse(updatedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByCustomer(String email) {
        List<Order> orders = orderRepository.findByCustomerEmailOrderByCreatedAtDesc(email);
        return orders.stream()
                .map(this::mapToOrderResponse)
                .toList();
    }

    private BigDecimal calculateSubtotal(Order order) {
        return order.getOrderLineItems()
                .stream()
                .map(this::calculateLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Orders created before audit history existed cannot reveal their exact
     * transitions. The initial and current states are still safely inferred
     * from their persisted timestamps, and are labelled as legacy data.
     */
    private List<OrderStatusHistoryResponse> inferredLegacyHistory(Order order) {
        OrderStatusHistoryResponse created = new OrderStatusHistoryResponse(
                null, null, OrderStatus.PENDING, order.getCreatedAt(), "SYSTEM", "Inferred initial status from legacy order record."
        );
        if (order.getStatus() == OrderStatus.PENDING) {
            return List.of(created);
        }
        OrderStatusHistoryResponse current = new OrderStatusHistoryResponse(
                null, OrderStatus.PENDING, order.getStatus(), order.getUpdatedAt(), "SYSTEM", "Inferred current status from legacy order record."
        );
        return List.of(created, current);
    }

    private LocalDateTime deliveredAt(Order order) {
        if (order.getDeliveredAt() != null) {
            return order.getDeliveredAt();
        }
        return order.getStatusHistory().stream()
                .filter(entry -> entry.getStatus() == OrderStatus.DELIVERED)
                .map(entry -> entry.getChangedAt())
                .reduce((first, second) -> second)
                .orElse(order.getStatus() == OrderStatus.DELIVERED ? order.getUpdatedAt() : null);
    }

    private boolean isCancellationEligible(Order order, LocalDateTime deliveredAt) {
        return order.getStatus() == OrderStatus.DELIVERED
                && deliveredAt != null
                && !LocalDateTime.now().isAfter(deliveredAt.plusDays(DELIVERED_CANCELLATION_WINDOW_DAYS));
    }

    private boolean isCustomerCancellationEligible(Order order, LocalDateTime deliveredAt) {
        return switch (order.getStatus()) {
            case PENDING, CONFIRMED, PROCESSING -> true;
            case DELIVERED -> isCancellationEligible(order, deliveredAt);
            default -> false;
        };
    }

    private boolean isAdministrator() {
        return SecurityContextHolder.getContext().getAuthentication().getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private BigDecimal calculateLineTotal(OrderLineItems item) {
        return item.getPrice()
                .multiply(BigDecimal.valueOf(item.getQuantity()))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private String normalizeIdempotencyKey(String idempotencyKey) {
        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return null;
        }

        return idempotencyKey.trim();
    }
}
