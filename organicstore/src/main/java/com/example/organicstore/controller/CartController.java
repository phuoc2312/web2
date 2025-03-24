package com.example.organicstore.controller;

import com.example.organicstore.dto.request.CartItemRequest;
import com.example.organicstore.dto.response.CartResponse;
import com.example.organicstore.dto.response.MessageResponse;
import com.example.organicstore.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/cart")
@PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
public class CartController {
    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart() {
        CartResponse cart = cartService.getCart();
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItemToCart(@Valid @RequestBody CartItemRequest cartItemRequest) {
        CartResponse updatedCart = cartService.addItemToCart(cartItemRequest);
        return ResponseEntity.ok(updatedCart);
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateCartItem(
            @PathVariable Long itemId,
            @Valid @RequestBody CartItemRequest cartItemRequest) {
        
        CartResponse updatedCart = cartService.updateCartItem(itemId, cartItemRequest);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeCartItem(@PathVariable Long itemId) {
        CartResponse updatedCart = cartService.removeCartItem(itemId);
        return ResponseEntity.ok(updatedCart);
    }

    @DeleteMapping("/clear")
    public ResponseEntity<MessageResponse> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok(new MessageResponse("Cart cleared successfully"));
    }
}