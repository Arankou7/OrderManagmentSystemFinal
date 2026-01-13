package com.example.thesis.inventory_service.dto;

public record InventoryResponse(
        String skuCode,
        int totalQuantity,
        int availableQuantity
) {}
