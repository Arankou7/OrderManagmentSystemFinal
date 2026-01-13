package com.example.thesis.order_service.dto;

import java.util.Map;

public record InventoryCheckResponse(Map<String, Boolean> availability) {
}
