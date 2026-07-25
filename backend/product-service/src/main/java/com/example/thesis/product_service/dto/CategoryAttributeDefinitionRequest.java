package com.example.thesis.product_service.dto;

import com.example.thesis.product_service.model.AttributeInputType;

import java.util.List;

public record CategoryAttributeDefinitionRequest(
        String name,
        AttributeInputType inputType,
        boolean required,
        List<String> allowedValues
) { }
