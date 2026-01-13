package com.example.thesis.inventory_service.repository;

import com.example.thesis.inventory_service.model.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findBySkuCode(String skuCode);
}
