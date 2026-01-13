package com.example.thesis.order_service.client;

import com.example.thesis.order_service.dto.InventoryCheckRequest;
import com.example.thesis.order_service.dto.InventoryCheckResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "inventory-service")
public interface InventoryClient {

    @PostMapping("/api/inventory/check")
    InventoryCheckResponse checkInventory(@RequestBody InventoryCheckRequest request);
}