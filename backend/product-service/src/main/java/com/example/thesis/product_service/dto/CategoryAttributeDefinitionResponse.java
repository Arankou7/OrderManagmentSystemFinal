package com.example.thesis.product_service.dto;

import com.example.thesis.product_service.model.AttributeInputType;

import java.util.List;
import java.util.UUID;

public record CategoryAttributeDefinitionResponse(
        UUID id,
        String name,
        AttributeInputType inputType,
        boolean required,
        List<String> allowedValues
) { }
