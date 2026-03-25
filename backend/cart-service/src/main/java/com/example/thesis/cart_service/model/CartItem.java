package com.example.thesis.cart_service.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CartItem {
    private String skuCode;

    @JsonProperty("productName")
    private String productName;

    private Integer quantity;
    private BigDecimal price;
}