package com.example.thesis.product_service.dto;

import java.util.List;

public record CategoryRequest(
        String name,
        String description,
        List<CategoryAttributeDefinitionRequest> attributeDefinitions
) { }
