package com.example.thesis.cart_service.service;

import com.example.thesis.cart_service.model.Cart;
import com.example.thesis.cart_service.model.CartItem;
import com.example.thesis.cart_service.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;

    public Cart getCart(String userId) {
        return cartRepository.findById(userId).orElse(new Cart(userId));
    }

    public Cart addToCart(String userId, CartItem newItem) {
        Cart cart = getCart(userId);

        Optional<CartItem> existingItem = cart.getItems().stream()
                .filter(item -> item.getSkuCode().equals(newItem.getSkuCode()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + newItem.getQuantity());
        } else {
            cart.getItems().add(newItem);
        }

        return cartRepository.save(cart);
    }

    public void clearCart(String userId) {
        cartRepository.deleteById(userId);
        log.info("Cart cleared for user: {}", userId);
    }

    public Cart removeItem(String userId, String skuCode) {
        Cart cart = getCart(userId);
        cart.getItems().removeIf(item -> item.getSkuCode().equals(skuCode));

        log.info("Removed item {} from cart for user {}", skuCode, userId);
        return cartRepository.save(cart);
    }

    public Cart updateItemQuantity(String userId, String skuCode, Integer newQuantity) {
        if (newQuantity <= 0) {
            return removeItem(userId, skuCode);
        }

        Cart cart = getCart(userId);

        cart.getItems().stream()
                .filter(item -> item.getSkuCode().equals(skuCode))
                .findFirst()
                .ifPresent(item -> item.setQuantity(newQuantity));

        log.info("Updated quantity for {} to {} for user {}", skuCode, newQuantity, userId);
        return cartRepository.save(cart);
    }
}