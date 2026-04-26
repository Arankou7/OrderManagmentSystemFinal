package com.example.thesis.order_service.controller;

import com.example.thesis.order_service.dto.OrderRequest;
import com.example.thesis.order_service.dto.OrderResponse;
import com.example.thesis.order_service.model.OrderStatus;
import com.example.thesis.order_service.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/order")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrderResponse placeOrder(@RequestBody OrderRequest request, @RequestHeader("Authorization") String token) {
        return orderService.placeOrder(request, token);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<OrderResponse> getOrders(){
        return orderService.getOrders();
    }

    @GetMapping("/{orderNumber}")
    @ResponseStatus(HttpStatus.OK)
    public OrderResponse getOrderByNumber(@PathVariable UUID orderNumber) {
        return orderService.getOrderByNumber(orderNumber);
    }

    @PatchMapping("/{orderNumber}/status")
    @ResponseStatus(HttpStatus.OK)
    public OrderResponse updateOrderStatus(@PathVariable UUID orderNumber, @RequestParam OrderStatus status) {
        return orderService.updateOrderStatus(orderNumber, status);
    }
    
    @GetMapping("/customer/{email}")
    @ResponseStatus(HttpStatus.OK)
    public List<OrderResponse> getOrdersByCustomer(@PathVariable String email) {
        return orderService.getOrdersByCustomer(email);
    }

    @GetMapping("/my-orders")
    @ResponseStatus(HttpStatus.OK)
    public List<OrderResponse> getMyOrders(@AuthenticationPrincipal Jwt jwt) {

        String email = jwt.getClaimAsString("email");
        if (email == null || email.isEmpty()) {
            email = jwt.getClaimAsString("preferred_username");
        }
        if (email == null || email.isEmpty()) {
            email = jwt.getSubject();
        }

        return orderService.getOrdersByCustomer(email);
    }

}
