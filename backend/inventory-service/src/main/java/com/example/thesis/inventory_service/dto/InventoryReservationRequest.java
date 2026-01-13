package com.example.thesis.inventory_service.dto;

import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record InventoryReservationRequest(
        @NotNull UUID orderNumber,
        List<InventoryCheckItem> items
) {}
