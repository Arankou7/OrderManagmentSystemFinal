package com.example.thesis.cart_service.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.redis.core.RedisHash;

import java.util.ArrayList;
import java.util.List;

@RedisHash(value = "Cart", timeToLive = 604800)
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Cart {

    @Id
    private String id;

    private List<CartItem> items = new ArrayList<>();

    public Cart(String id) {
        this.id = id;
    }
}