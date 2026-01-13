package com.example.thesis.product_service.dto;

import java.util.UUID;

public record ProductAttributeResponse(UUID id,
                                       String key,
                                       String value) {

}
