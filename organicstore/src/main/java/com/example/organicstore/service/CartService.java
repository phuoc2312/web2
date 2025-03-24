package com.example.organicstore.service;

import com.example.organicstore.dto.request.CartItemRequest;
import com.example.organicstore.dto.response.CartItemResponse;
import com.example.organicstore.dto.response.CartResponse;
import com.example.organicstore.exception.ResourceNotFoundException;
import com.example.organicstore.model.Cart;
import com.example.organicstore.model.CartItem;
import com.example.organicstore.model.Product;
import com.example.organicstore.model.User;
import com.example.organicstore.repository.CartItemRepository;
import com.example.organicstore.repository.CartRepository;
import com.example.organicstore.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;
    
    @Autowired
    private CartItemRepository cartItemRepository;
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private UserService userService;

    public CartResponse getCart() {
        User currentUser = userService.getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse addItemToCart(CartItemRequest cartItemRequest) {
        User currentUser = userService.getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        Product product = productRepository.findById(cartItemRequest.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + cartItemRequest.getProductId()));
        
        if (product.getStockQuantity() < cartItemRequest.getQuantity()) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity());
        }
        
        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(cartItemRequest.getProductId()))
                .findFirst();
        
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + cartItemRequest.getQuantity();
            
            if (product.getStockQuantity() < newQuantity) {
                throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity());
            }
            
            existingItem.setQuantity(newQuantity);
            updateCartItemPrice(existingItem);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(cartItemRequest.getQuantity());
            updateCartItemPrice(newItem);
            
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }
        
        updateCartTotalPrice(cart);
        cartRepository.save(cart);
        
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse updateCartItem(Long itemId, CartItemRequest cartItemRequest) {
        User currentUser = userService.getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));
        
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user's cart");
        }
        
        Product product = cartItem.getProduct();
        
        if (product.getStockQuantity() < cartItemRequest.getQuantity()) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStockQuantity());
        }
        
        cartItem.setQuantity(cartItemRequest.getQuantity());
        updateCartItemPrice(cartItem);
        cartItemRepository.save(cartItem);
        
        updateCartTotalPrice(cart);
        cartRepository.save(cart);
        
        return mapToCartResponse(cart);
    }

    @Transactional
    public CartResponse removeCartItem(Long itemId) {
        User currentUser = userService.getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));
        
        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Cart item does not belong to user's cart");
        }
        
        cart.getItems().remove(cartItem);
        cartItemRepository.delete(cartItem);
        
        updateCartTotalPrice(cart);
        cartRepository.save(cart);
        
        return mapToCartResponse(cart);
    }

    @Transactional
    public void clearCart() {
        User currentUser = userService.getCurrentUser();
        Cart cart = getOrCreateCart(currentUser);
        
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setTotalPrice(BigDecimal.ZERO);
        cartRepository.save(cart);
    }
    
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUser(user)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    newCart.setTotalPrice(BigDecimal.ZERO);
                    return cartRepository.save(newCart);
                });
    }
    
    private void updateCartItemPrice(CartItem cartItem) {
        Product product = cartItem.getProduct();
        BigDecimal price = product.getDiscountedPrice() != null ? product.getDiscountedPrice() : product.getPrice();
        cartItem.setPrice(price);
        cartItem.setSubtotal(price.multiply(BigDecimal.valueOf(cartItem.getQuantity())));
    }
    
    private void updateCartTotalPrice(Cart cart) {
        BigDecimal total = cart.getItems().stream()
                .map(CartItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalPrice(total);
    }
    
    private CartResponse mapToCartResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        
        List<CartItemResponse> items = new ArrayList<>();
        if (cart.getItems() != null) {
            items = cart.getItems().stream()
                    .map(this::mapToCartItemResponse)
                    .collect(Collectors.toList());
        }
        
        response.setItems(items);
        response.setTotalPrice(cart.getTotalPrice().toString());
        response.setItemCount(items.size());
        response.setTotalQuantity(items.stream().mapToInt(CartItemResponse::getQuantity).sum());
        
        return response;
    }
    
    private CartItemResponse mapToCartItemResponse(CartItem cartItem) {
        CartItemResponse response = new CartItemResponse();
        response.setId(cartItem.getId());
        response.setProductId(cartItem.getProduct().getId());
        response.setProductName(cartItem.getProduct().getName());
        response.setProductSlug(cartItem.getProduct().getSlug());
        
        // Get main image if available
        if (cartItem.getProduct().getImages() != null && !cartItem.getProduct().getImages().isEmpty()) {
            cartItem.getProduct().getImages().stream()
                    .filter(image -> image.isPrimary())
                    .findFirst()
                    .ifPresent(image -> response.setProductImage(image.getImageUrl()));
        }
        
        response.setPrice(cartItem.getPrice().toString());
        response.setQuantity(cartItem.getQuantity());
        response.setSubtotal(cartItem.getSubtotal().toString());
        
        return response;
    }
}