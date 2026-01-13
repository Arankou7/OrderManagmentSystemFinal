package com.example.thesis.inventory_service.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "inventory_reservations",
        indexes = @Index(name = "idx_reservation_sku", columnList = "skuCode"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryReservation {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String skuCode;

    @Column(nullable = false)
    private Integer reservedQuantity;

    @Column(nullable = false)
    private UUID orderNumber;

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
