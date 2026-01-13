package com.example.thesis.inventory_service.dto;

import java.util.UUID;

public record InventoryReservationResponse(
        UUID orderNumber,
        boolean reserved
) {}
