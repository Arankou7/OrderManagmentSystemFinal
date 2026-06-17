package com.example.thesis.order_service.repository;

import com.example.thesis.order_service.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order,Long> {
    Optional<Order> findByOrderNumber(UUID orderNumber);

    List<Order> findByCustomerEmailOrderByCreatedAtDesc(String customerEmail);

    Optional<Order> findByCustomerEmailAndIdempotencyKey(String customerEmail, String idempotencyKey);
}
