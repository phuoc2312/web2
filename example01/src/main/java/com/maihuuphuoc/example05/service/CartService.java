package com.maihuuphuoc.example05.service;

import java.util.List;

import com.maihuuphuoc.example05.payloads.CartDTO;

public interface CartService {
    CartDTO addProductToCart(Long cartId, Long productId, Integer quantity);

    List<CartDTO> getAllCarts();

    CartDTO getCart(String emailId, Long cartId);

    CartDTO updateProductQuantityInCart(Long cartId, Long productId, Integer quantity);

    void updateProductInCarts(Long cartId, Long productId);

    String deleteProductFromCart(Long cartId, Long productId);

    CartDTO createNewCart(String email);

    CartDTO getCartByEmail(String email);

}