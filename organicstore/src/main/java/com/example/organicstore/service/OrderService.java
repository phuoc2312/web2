package com.example.organicstore.service;

import com.example.organicstore.dto.request.OrderRequest;
import com.example.organicstore.dto.response.OrderItemResponse;
import com.example.organicstore.dto.response.OrderResponse;
import com.example.organicstore.dto.response.PagedResponse;
import com.example.organicstore.exception.ResourceNotFoundException;
import com.example.organicstore.model.*;
import com.example.organicstore.repository.OrderRepository;
import com.example.organicstore.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CartService cartService;

    @Autowired
    private UserService userService;

    @Transactional
    public OrderResponse createOrder(OrderRequest orderRequest) {
        User currentUser = userService.getCurrentUser();

        // Get user's cart
        Cart cart = cartService.getOrCreateCart(currentUser);

        if (cart.getItems() == null || cart.getItems().isEmpty()) {
            throw new RuntimeException("Cannot create order with empty cart");
        }

        // Create new order
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(currentUser);
        order.setStatus(OrderStatus.PENDING);
        order.setPaymentMethod(orderRequest.getPaymentMethod());
        order.setPaid(false);
        order.setNotes(orderRequest.getNotes());

        // Set shipping address
        ShippingAddress shippingAddress = new ShippingAddress();
        shippingAddress.setFullName(orderRequest.getShippingAddress().getFullName());
        shippingAddress.setPhone(orderRequest.getShippingAddress().getPhone());
        shippingAddress.setAddressLine1(orderRequest.getShippingAddress().getAddressLine1());
        shippingAddress.setAddressLine2(orderRequest.getShippingAddress().getAddressLine2());
        shippingAddress.setCity(orderRequest.getShippingAddress().getCity());
        shippingAddress.setState(orderRequest.getShippingAddress().getState());
        shippingAddress.setPostalCode(orderRequest.getShippingAddress().getPostalCode());
        shippingAddress.setCountry(orderRequest.getShippingAddress().getCountry());
        order.setShippingAddress(shippingAddress);

        // Calculate order totals
        BigDecimal subtotal = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            // Check stock
            Product product = cartItem.getProduct();
            if (product.getStock() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for product: " + product.getName());
            }

            // Create order item
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setProductName(product.getName());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());
            orderItem.setSubtotal(cartItem.getSubtotal());

            order.getItems().add(orderItem);
            subtotal = subtotal.add(cartItem.getSubtotal());

            // Update product stock
            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setSubtotal(subtotal);

        // Calculate shipping cost (simplified)
        BigDecimal shippingCost = subtotal.compareTo(new BigDecimal("500000")) > 0 ? BigDecimal.ZERO
                : new BigDecimal("30000");
        order.setShippingCost(shippingCost);

        // Calculate tax (simplified - 10%)
        BigDecimal tax = subtotal.multiply(new BigDecimal("0.1"));
        order.setTax(tax);

        // Calculate total
        BigDecimal total = subtotal.add(shippingCost).add(tax);
        order.setTotal(total);

        // Save order
        Order savedOrder = orderRepository.save(order);

        // Clear cart
        cartService.clearCart();

        return mapToOrderResponse(savedOrder);
    }

    public List<OrderResponse> getCurrentUserOrders() {
        User currentUser = userService.getCurrentUser();
        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(currentUser);

        return orders.stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());
    }

    public PagedResponse<OrderResponse> getCurrentUserOrdersPaged(int page, int size) {
        User currentUser = userService.getCurrentUser();

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findByUser(currentUser, pageable);

        List<OrderResponse> content = orders.getContent().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                orders.getNumber(),
                orders.getSize(),
                orders.getTotalElements(),
                orders.getTotalPages(),
                orders.isLast());
    }

    public OrderResponse getOrderById(Long id) {
        User currentUser = userService.getCurrentUser();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        // Check if order belongs to current user or user is admin
        if (!order.getUser().getId().equals(currentUser.getId()) &&
                !userService.isCurrentUserAdmin()) {
            throw new RuntimeException("You are not authorized to view this order");
        }

        return mapToOrderResponse(order);
    }

    public PagedResponse<OrderResponse> getAllOrders(int page, int size) {
        // Only admin can access all orders
        if (!userService.isCurrentUserAdmin()) {
            throw new RuntimeException("You are not authorized to access all orders");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Order> orders = orderRepository.findAll(pageable);

        List<OrderResponse> content = orders.getContent().stream()
                .map(this::mapToOrderResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                orders.getNumber(),
                orders.getSize(),
                orders.getTotalElements(),
                orders.getTotalPages(),
                orders.isLast());
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long id, String status) {
        // Only admin can update order status
        if (!userService.isCurrentUserAdmin()) {
            throw new RuntimeException("You are not authorized to update order status");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(orderStatus);

            // If order is delivered, mark as paid
            if (orderStatus == OrderStatus.DELIVERED && !order.isPaid()) {
                order.setPaid(true);
                order.setPaidAt(LocalDateTime.now());
            }

            // If order is cancelled, restore product stock
            if (orderStatus == OrderStatus.CANCELLED) {
                for (OrderItem item : order.getItems()) {
                    Product product = item.getProduct();
                    product.setStock(product.getStock() + item.getQuantity());
                    productRepository.save(product);
                }
            }

            Order updatedOrder = orderRepository.save(order);
            return mapToOrderResponse(updatedOrder);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }
    }

    @Transactional
    public OrderResponse updatePaymentStatus(Long id, boolean isPaid) {
        // Only admin can update payment status
        if (!userService.isCurrentUserAdmin()) {
            throw new RuntimeException("You are not authorized to update payment status");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        order.setPaid(isPaid);

        if (isPaid) {
            order.setPaidAt(LocalDateTime.now());
        } else {
            order.setPaidAt(null);
        }

        Order updatedOrder = orderRepository.save(order);
        return mapToOrderResponse(updatedOrder);
    }

    @Transactional
    public void deleteOrder(Long id) {
        // Only admin can delete orders
        if (!userService.isCurrentUserAdmin()) {
            throw new RuntimeException("You are not authorized to delete orders");
        }

        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        // Restore product stock if order is not cancelled
        if (order.getStatus() != OrderStatus.CANCELLED) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            }
        }

        orderRepository.delete(order);
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setUserId(order.getUser().getId());
        response.setUserName(order.getUser().getFullName());
        response.setStatus(order.getStatus().name());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setPaid(order.isPaid());
        response.setPaidAt(order.getPaidAt());

        // Set shipping address
        response.setShippingAddress(order.getShippingAddress());

        // Set order items
        List<OrderItemResponse> items = order.getItems().stream()
                .map(this::mapToOrderItemResponse)
                .collect(Collectors.toList());
        response.setItems(items);

        response.setSubtotal(order.getSubtotal().toString());
        response.setShippingCost(order.getShippingCost().toString());
        response.setTax(order.getTax().toString());
        response.setTotal(order.getTotal().toString());
        response.setNotes(order.getNotes());
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());

        return response;
    }

    private OrderItemResponse mapToOrderItemResponse(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(orderItem.getId());
        response.setProductId(orderItem.getProduct().getId());
        response.setProductName(orderItem.getProductName());
        response.setProductSlug(orderItem.getProduct().getSlug());

        // Get product image if available
        if (orderItem.getProduct().getImages() != null && !orderItem.getProduct().getImages().isEmpty()) {
            orderItem.getProduct().getImages().stream()
                    .filter(image -> image.isMain())
                    .findFirst()
                    .ifPresent(image -> response.setProductImage(image.getImageUrl()));
        }

        response.setQuantity(orderItem.getQuantity());
        response.setPrice(orderItem.getPrice().toString());
        response.setSubtotal(orderItem.getSubtotal().toString());

        return response;
    }
}