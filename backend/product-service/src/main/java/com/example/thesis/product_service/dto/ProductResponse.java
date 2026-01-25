package com.example.thesis.product_service.dto;

import com.example.thesis.product_service.model.ProductStatus;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;


public record ProductResponse(UUID id,String skuCode, String name, String description, BigDecimal price,
                              String category, ProductStatus status, List<ProductAttributeResponse> attributes) {
}
