package com.example.thesis.product_service.dto;

import com.example.thesis.product_service.model.ProductStatus;

import java.math.BigDecimal;
import java.util.List;


public record ProductResponse(String name, String description, BigDecimal price,
                              String category, ProductStatus status, List<ProductAttributeResponse> attributes) {
}
