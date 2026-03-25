package com.example.thesis.order_service.client;

import com.example.thesis.order_service.dto.CartResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestHeader;

// Connects to the cart-service registered in Eureka
@FeignClient(name = "cart-service")
public interface CartClient {

    // We pass the JWT token in the header so Cart Service knows WHO is asking
    @GetMapping("/api/cart")
    CartResponse getCart(@RequestHeader("Authorization") String token);

    @DeleteMapping("/api/cart/clear")
    void clearCart(@RequestHeader("Authorization") String token);
}