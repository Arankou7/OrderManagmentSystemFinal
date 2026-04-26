package com.example.thesis.order_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.UUID;

@FeignClient(name = "inventory-service")
public interface InventoryClient {

    @PostMapping("/api/inventory/confirm")
    void confirmReservation(
            @RequestHeader("Authorization") String token,
            @RequestParam("orderNumber") UUID orderNumber
    );
}