package com.example.thesis.inventory_service.dto;

import java.util.Map;

public record InventoryCheckResponse(
        Map<String, Boolean> availability
) {}
