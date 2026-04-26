package com.example.thesis.cart_service.dto;

import java.util.List;
import java.util.UUID;

public record InventoryReservationRequest(UUID orderNumber, List<InventoryCheckItem> items) {}
