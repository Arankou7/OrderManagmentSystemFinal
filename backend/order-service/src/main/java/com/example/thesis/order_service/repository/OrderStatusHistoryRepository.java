package com.example.thesis.order_service.repository;

import com.example.thesis.order_service.model.OrderStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderStatusHistoryRepository extends JpaRepository<OrderStatusHistory, Long> { }
