package com.example.thesis.order_service.dto;

import java.math.BigDecimal;

public record OrderLineItemsRequest(String skuCode,
                                    String name,
                                    BigDecimal price,
                                    Integer quantity) {
}
