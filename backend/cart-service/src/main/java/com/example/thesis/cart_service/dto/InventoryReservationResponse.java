package com.example.thesis.cart_service.dto;

import java.util.UUID;

public record InventoryReservationResponse(UUID orderNumber, boolean reserved){}
