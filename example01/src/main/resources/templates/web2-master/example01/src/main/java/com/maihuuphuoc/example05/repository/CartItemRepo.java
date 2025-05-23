package com.maihuuphuoc.example05.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.maihuuphuoc.example05.entity.CartItem;
import com.maihuuphuoc.example05.entity.Product;

public interface CartItemRepo extends JpaRepository<CartItem, Long> {
    @Query("SELECT ci.product FROM CartItem ci WHERE ci.product.id = :productId")
    Product findProductById(@Param("productId") Long productId);

    @Query("SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId")
    CartItem findCartItemByProductIdAndCartId(@Param("cartId") Long cartId, @Param("productId") Long productId);

    @Modifying
    @Query("DELETE FROM CartItem ci WHERE ci.cart.id = :cartId AND ci.product.id = :productId")
    void deleteCartItemByProductIdAndCartId(@Param("cartId") Long cartId, @Param("productId") Long productId);
}