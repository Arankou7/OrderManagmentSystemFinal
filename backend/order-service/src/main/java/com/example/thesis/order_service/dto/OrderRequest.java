package com.example.thesis.order_service.dto;

import java.util.List;

public record OrderRequest(String customerEmail,
                           List<OrderLineItemsRequest> orderLineItems) {
}
