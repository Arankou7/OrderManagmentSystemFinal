package com.example.thesis.order_service.dto;

import java.util.List;

public record CartResponse(
        String id,
        List<CartItemResponse> items
) {
}