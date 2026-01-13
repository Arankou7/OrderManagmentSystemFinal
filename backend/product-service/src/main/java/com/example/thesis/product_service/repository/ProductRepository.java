package com.example.thesis.product_service.repository;

import com.example.thesis.product_service.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID> {
    Optional<Product> findBySkuCode(String skuCode);
}
