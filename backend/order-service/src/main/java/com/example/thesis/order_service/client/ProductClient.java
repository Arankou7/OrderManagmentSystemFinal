package com.example.thesis.order_service.client;

import com.example.thesis.order_service.dto.ProductResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "product-service")
public interface ProductClient {

    @GetMapping("/api/product/sku/{skuCode}")
    ProductResponse getProductBySku(@PathVariable("skuCode") String skuCode);
}