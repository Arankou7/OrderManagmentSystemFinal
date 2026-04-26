package com.example.thesis.cart_service.client;

import com.example.thesis.cart_service.dto.InventoryReservationRequest;
import com.example.thesis.cart_service.dto.InventoryReservationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "inventory-service")
public interface InventoryClient {

    @PostMapping("/api/inventory/reserve")
    InventoryReservationResponse reserve(
            @RequestHeader("Authorization") String token,
            @RequestBody InventoryReservationRequest request);

    @PostMapping("/api/inventory/release")
    void release(
            @RequestHeader("Authorization") String token,
            @RequestParam("orderNumber") UUID orderNumber);
}