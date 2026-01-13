package com.example.thesis.inventory_service.controller;

import com.example.thesis.inventory_service.dto.*;
import com.example.thesis.inventory_service.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/sku/{skuCode}")
    public InventoryResponse getInventory(@PathVariable String skuCode) {
        return inventoryService.getInventory(skuCode);
    }

    @PostMapping("/check")
    public InventoryCheckResponse checkInventory(@RequestBody InventoryCheckRequest request) {
        return inventoryService.checkAvailability(request);
    }

    @PostMapping("/reserve")
    public InventoryReservationResponse reserve(@RequestBody InventoryReservationRequest request) {
        return inventoryService.reserveStock(request);
    }

    @PostMapping("/confirm")
    public void confirm(@RequestParam UUID orderNumber) {
        inventoryService.confirmReservation(orderNumber);
    }

    @PostMapping("/release")
    public void release(@RequestParam UUID orderNumber) {
        inventoryService.releaseReservation(orderNumber);
    }

    @PostMapping("/restock")
    public void restock(@RequestBody InventoryRestockRequest request) {
        inventoryService.restock(request);
    }

    @PostMapping("/create")
    public InventoryResponse createInventory(@RequestBody InventoryCreateRequest request) {
        return inventoryService.createInventory(request);
    }
}
