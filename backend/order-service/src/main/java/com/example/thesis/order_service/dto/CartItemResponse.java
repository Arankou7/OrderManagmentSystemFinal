package com.example.thesis.order_service.dto;

import java.math.BigDecimal;

public record CartItemResponse(
        String skuCode,
        String productName,
        Integer quantity,
        BigDecimal price
) {}