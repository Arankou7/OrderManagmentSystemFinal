package com.example.thesis.product_service.dto;

import java.util.List;

/**
 * A catalogue recommendation together with the reasons that made it relevant.
 * Returning the reasons makes the rule-based algorithm explainable in the UI
 * and easy to evaluate in a diploma/project demonstration.
 */
public record RelatedProductResponse(
        ProductResponse product,
        int relevanceScore,
        List<String> matchReasons
) { }
