package com.example.thesis.inventory_service.dto;

public record InventoryCreateRequest(String skuCode,
                                     Integer quantity) {}
