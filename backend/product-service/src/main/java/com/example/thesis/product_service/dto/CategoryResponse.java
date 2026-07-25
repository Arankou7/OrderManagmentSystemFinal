package com.example.thesis.product_service.dto;

import java.util.List;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String name,
        String description,
        List<CategoryAttributeDefinitionResponse> attributeDefinitions
) { }
