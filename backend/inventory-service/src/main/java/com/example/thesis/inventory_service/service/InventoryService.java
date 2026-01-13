package com.example.thesis.inventory_service.service;

import com.example.thesis.inventory_service.dto.*;
import com.example.thesis.inventory_service.model.InventoryItem;
import com.example.thesis.inventory_service.model.InventoryReservation;
import com.example.thesis.inventory_service.model.InventoryStatus;
import com.example.thesis.inventory_service.repository.InventoryItemRepository;
import com.example.thesis.inventory_service.repository.InventoryReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryItemRepository itemRepository;
    private final InventoryReservationRepository reservationRepository;

    public InventoryResponse getInventory(String skuCode) {
        InventoryItem item = itemRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("SKU not found: " + skuCode));

        int reserved = reservationRepository.sumActiveReservations(skuCode);
        int available = item.getTotalQuantity() - reserved;

        return new InventoryResponse(
                skuCode,
                item.getTotalQuantity(),
                available
        );
    }

    public InventoryCheckResponse checkAvailability(InventoryCheckRequest request) {
        Map<String, Boolean> result = new HashMap<>();

        for (InventoryCheckItem item : request.items()) {
            InventoryItem inventory = itemRepository.findBySkuCode(item.skuCode())
                    .orElse(null);

            if (inventory == null) {
                result.put(item.skuCode(), false);
                continue;
            }

            int reserved = reservationRepository.sumActiveReservations(item.skuCode());
            int available = inventory.getTotalQuantity() - reserved;

            result.put(item.skuCode(), available >= item.quantity());
        }

        return new InventoryCheckResponse(result);
    }

    @Transactional
    public InventoryReservationResponse reserveStock(InventoryReservationRequest request) {
        for (InventoryCheckItem item : request.items()) {
            InventoryItem inventory = itemRepository.findBySkuCode(item.skuCode())
                    .orElseThrow(() -> new RuntimeException("SKU not found"));

            int reserved = reservationRepository.sumActiveReservations(item.skuCode());
            int available = inventory.getTotalQuantity() - reserved;

            if (available < item.quantity()) {
                return new InventoryReservationResponse(request.orderNumber(), false);
            }
        }

        for (InventoryCheckItem item : request.items()) {
            InventoryReservation reservation = InventoryReservation.builder()
                    .skuCode(item.skuCode())
                    .reservedQuantity(item.quantity())
                    .orderNumber(request.orderNumber())
                    .expiresAt(LocalDateTime.now().plusMinutes(15))
                    .build();

            reservationRepository.save(reservation);
        }

        return new InventoryReservationResponse(request.orderNumber(), true);
    }

    @Transactional
    public void confirmReservation(UUID orderNumber) {
        List<InventoryReservation> reservations = reservationRepository.findByOrderNumber(orderNumber);
        for (InventoryReservation r : reservations) {
            InventoryItem item = itemRepository.findBySkuCode(r.getSkuCode())
                    .orElseThrow(() -> new RuntimeException("SKU not found"));
            item.setTotalQuantity(item.getTotalQuantity() - r.getReservedQuantity());
            itemRepository.save(item);
        }
        reservationRepository.deleteByOrderNumber(orderNumber);
    }
    @Transactional
    public void releaseReservation(UUID orderNumber) {
        reservationRepository.deleteByOrderNumber(orderNumber);
    }

    @Transactional
    public void restock(InventoryRestockRequest request) {

        InventoryItem item = itemRepository.findBySkuCode(request.skuCode())
                .orElse(
                        InventoryItem.builder()
                                .skuCode(request.skuCode())
                                .totalQuantity(0)
                                .status(InventoryStatus.OUT_OF_STOCK) // ✅ IMPORTANT
                                .build()
                );

        item.setTotalQuantity(item.getTotalQuantity() + request.quantity());

        itemRepository.save(item);
    }

    public InventoryResponse createInventory(InventoryCreateRequest request) {
        InventoryItem item = InventoryItem.builder()
                .skuCode(request.skuCode())
                .totalQuantity(request.quantity())
                .build();

        itemRepository.save(item);

        return new InventoryResponse(
                item.getSkuCode(),
                item.getTotalQuantity(),
                item.getTotalQuantity()
        );
    }

}

