package com.example.thesis.inventory_service.repository;

import com.example.thesis.inventory_service.model.InventoryReservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface InventoryReservationRepository
        extends JpaRepository<InventoryReservation, UUID> {

    @Query("""
        SELECT COALESCE(SUM(r.reservedQuantity), 0)
        FROM InventoryReservation r
        WHERE r.skuCode = :skuCode
        AND r.expiresAt > CURRENT_TIMESTAMP
    """)
    int sumActiveReservations(String skuCode);

    void deleteByOrderNumber(UUID orderNumber);

    List<InventoryReservation> findByOrderNumber(UUID orderNumber);
}
