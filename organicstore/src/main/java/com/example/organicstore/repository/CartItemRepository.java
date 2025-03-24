package com.example.organicstore.repository;

import com.example.organicstore.model.Cart;
import com.example.organicstore.model.CartItem;
import com.example.organicstore.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}