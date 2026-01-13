package com.example.thesis.inventory_service.dto;

import java.util.List;

public record InventoryCheckRequest(
        List<InventoryCheckItem> items
) {}
