package com.example.thesis.inventory_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record InventoryCheckItem(
        @NotBlank String skuCode,
        @NotNull @Positive Integer quantity
) {}
