package com.example.thesis.inventory_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record InventoryRestockRequest(
        @NotBlank String skuCode,
        @Positive Integer quantity
) {}
