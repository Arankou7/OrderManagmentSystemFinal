package com.example.thesis.cart_service.controller;

import com.example.thesis.cart_service.model.Cart;
import com.example.thesis.cart_service.model.CartItem;
import com.example.thesis.cart_service.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    // The @AuthenticationPrincipal grabs the JWT token from Keycloak
    // jwt.getSubject() extracts the unique User ID.
    // This makes it impossible for users to access other people's carts!

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public Cart getCart(@AuthenticationPrincipal Jwt jwt) {
        return cartService.getCart(jwt.getSubject());
    }

    @PostMapping("/add")
    @ResponseStatus(HttpStatus.OK)
    public Cart addToCart(@AuthenticationPrincipal Jwt jwt, @RequestBody CartItem cartItem) {
        return cartService.addToCart(jwt.getSubject(), cartItem);
    }

    @DeleteMapping("/clear")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void clearCart(@AuthenticationPrincipal Jwt jwt) {
        cartService.clearCart(jwt.getSubject());
    }

    @DeleteMapping("/item/{skuCode}")
    @ResponseStatus(HttpStatus.OK)
    public Cart removeItem(@AuthenticationPrincipal Jwt jwt, @PathVariable String skuCode) {
        return cartService.removeItem(jwt.getSubject(), skuCode);
    }

    @PutMapping("/item/{skuCode}")
    @ResponseStatus(HttpStatus.OK)
    public Cart updateItemQuantity(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable String skuCode,
            @RequestParam Integer quantity) {

        return cartService.updateItemQuantity(jwt.getSubject(), skuCode, quantity);
    }
}