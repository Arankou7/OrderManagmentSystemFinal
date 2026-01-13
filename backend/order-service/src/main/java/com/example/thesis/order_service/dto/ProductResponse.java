package com.example.thesis.order_service.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductResponse(
        UUID id,
        String name,
        String description,
        String skuCode,
        BigDecimal price
) {}
