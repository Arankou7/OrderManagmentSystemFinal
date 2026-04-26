package com.example.thesis.cart_service.service;

import com.example.thesis.cart_service.client.InventoryClient;
import com.example.thesis.cart_service.dto.InventoryCheckItem;
import com.example.thesis.cart_service.dto.InventoryReservationRequest;
import com.example.thesis.cart_service.dto.InventoryReservationResponse;
import com.example.thesis.cart_service.model.Cart;
import com.example.thesis.cart_service.model.CartItem;
import com.example.thesis.cart_service.repository.CartRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CartService {

    private final CartRepository cartRepository;
    private final InventoryClient inventoryClient;

    public Cart getCart(String userId) {
        return cartRepository.findById(userId).orElse(new Cart(userId));
    }

    public Cart addToCart(String userId, CartItem newItem, String token) {
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

        syncCartWithInventory(userId, cart.getItems(), token);

        return cartRepository.save(cart);
    }

    public void clearCart(String userId, String token) {
        inventoryClient.release(token, getCartReservationId(userId));
        cartRepository.deleteById(userId);
        log.info("Cart cleared for user: {}", userId);
    }

    public Cart removeItem(String userId, String skuCode, String token) {
        Cart cart = getCart(userId);
        cart.getItems().removeIf(item -> item.getSkuCode().equals(skuCode));

        syncCartWithInventory(userId, cart.getItems(), token);

        log.info("Removed item {} from cart for user {}", skuCode, userId);
        return cartRepository.save(cart);
    }

    public Cart updateItemQuantity(String userId, String skuCode, Integer newQuantity, String token) {
        if (newQuantity <= 0) {
            return removeItem(userId, skuCode, token);
        }

        Cart cart = getCart(userId);
        cart.getItems().stream()
                .filter(item -> item.getSkuCode().equals(skuCode))
                .findFirst()
                .ifPresent(item -> item.setQuantity(newQuantity));

        syncCartWithInventory(userId, cart.getItems(), token);

        log.info("Updated quantity for {} to {} for user {}", skuCode, newQuantity, userId);
        return cartRepository.save(cart);
    }

    private void syncCartWithInventory(String userId, List<CartItem> currentItems, String token) {
        UUID cartReservationId = getCartReservationId(userId);

        log.info("Attempting to sync cart with inventory using reservation ID: {}", cartReservationId);

        try {
            inventoryClient.release(token, cartReservationId);
        } catch (Exception e) {
            log.warn("Failed to release old reservations for cart {}, might already be empty", cartReservationId);
        }

        if (currentItems.isEmpty()) {
            return;
        }

        List<InventoryCheckItem> inventoryItems = currentItems.stream()
                .map(item -> new InventoryCheckItem(item.getSkuCode(), item.getQuantity()))
                .toList();

        InventoryReservationRequest request = new InventoryReservationRequest(cartReservationId, inventoryItems);

        InventoryReservationResponse response = inventoryClient.reserve(token, request);

        if (!response.reserved()) {
            throw new RuntimeException("Insufficient stock available to update the cart.");
        }
    }

    private UUID getCartReservationId(String userId) {
        return UUID.nameUUIDFromBytes(userId.getBytes());
    }
}