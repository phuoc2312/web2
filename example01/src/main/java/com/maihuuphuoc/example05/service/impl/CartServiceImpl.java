package com.maihuuphuoc.example05.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.maihuuphuoc.example05.entity.Cart;
import com.maihuuphuoc.example05.entity.CartItem;
import com.maihuuphuoc.example05.entity.Product;
import com.maihuuphuoc.example05.entity.User;
import com.maihuuphuoc.example05.exceptions.APIException;
import com.maihuuphuoc.example05.exceptions.ResourceNotFoundException;
import com.maihuuphuoc.example05.payloads.CartDTO;
import com.maihuuphuoc.example05.payloads.ProductDTO;
import com.maihuuphuoc.example05.repository.CartItemRepo;
import com.maihuuphuoc.example05.repository.CartRepo;
import com.maihuuphuoc.example05.repository.ProductRepo;
import com.maihuuphuoc.example05.repository.UserRepo;
import com.maihuuphuoc.example05.service.CartService;

import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Transactional
@Service
public class CartServiceImpl implements CartService {
    private static final Logger logger = LoggerFactory.getLogger(CartServiceImpl.class);

    @Autowired
    private CartRepo cartRepo;

    @Autowired
    private ProductRepo productRepo;

    @Autowired
    private CartItemRepo cartItemRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public CartDTO addProductToCart(Long cartId, Long productId, Integer quantity) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        if (product.getQuantity() == null || product.getQuantity() == 0) {
            throw new APIException(product.getProductName() + " is not available");
        }

        if (product.getQuantity() < quantity) {
            throw new APIException("Please, make an order of the " + product.getProductName()
                    + " less than or equal to the quantity " + product.getQuantity() + ".");
        }

        CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);
        if (cartItem != null) {
            Integer currentQuantity = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;
            cartItem.setQuantity(currentQuantity + quantity);
            cartItem.setProductPrice(product.getSpecialPrice());
            cartItem.setDiscount(product.getDiscount());
            cartItemRepo.save(cartItem);
        } else {
            CartItem newCartItem = new CartItem();
            newCartItem.setProduct(product);
            newCartItem.setCart(cart);
            newCartItem.setQuantity(quantity);
            newCartItem.setDiscount(product.getDiscount());
            newCartItem.setProductPrice(product.getSpecialPrice());
            cartItemRepo.save(newCartItem);
        }

        product.setQuantity(product.getQuantity() - quantity);
        cart.setTotalPrice(cart.getTotalPrice() + (product.getSpecialPrice() * quantity));

        cartRepo.save(cart);

        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
        List<ProductDTO> productDTOS = cart.getCartItems().stream()
                .map(item -> {
                    ProductDTO productDTO = modelMapper.map(item.getProduct(), ProductDTO.class);
                    productDTO.setCartItemQuantity(item.getQuantity() != null ? item.getQuantity() : 0);
                    productDTO.setStock(item.getProduct().getQuantity() != null ? item.getProduct().getQuantity() : 0);
                    return productDTO;
                }).collect(Collectors.toList());
        cartDTO.setProducts(productDTOS);
        int totalQuantity = cart.getCartItems().stream()
                .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                .sum();
        cartDTO.setQuantity(totalQuantity);
        return cartDTO;
    }

    @Override
    public List<CartDTO> getAllCarts() {
        List<User> users = userRepo.findAll(); // Lấy tất cả người dùng
        List<Cart> carts = users.stream()
                .map(user -> {
                    Cart cart = cartRepo.findByUser(user);
                    if (cart == null) {
                        // Tạo giỏ hàng mới nếu chưa có
                        Cart newCart = new Cart();
                        newCart.setUser(user);
                        newCart.setTotalPrice(0.0);
                        return cartRepo.save(newCart);
                    }
                    return cart;
                })
                .collect(Collectors.toList());

        if (carts.isEmpty()) {
            throw new APIException("No cart exists");
        }

        return carts.stream().map(cart -> {
            CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
            cartDTO.setEmail(cart.getUser().getEmail()); // Thêm email vào CartDTO
            List<ProductDTO> products = cart.getCartItems().stream()
                    .map(item -> {
                        ProductDTO productDTO = modelMapper.map(item.getProduct(), ProductDTO.class);
                        productDTO.setCartItemQuantity(item.getQuantity() != null ? item.getQuantity() : 0);
                        productDTO.setStock(
                                item.getProduct().getQuantity() != null ? item.getProduct().getQuantity() : 0);
                        return productDTO;
                    }).collect(Collectors.toList());
            cartDTO.setProducts(products);
            int totalQuantity = cart.getCartItems().stream()
                    .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                    .sum();
            cartDTO.setQuantity(totalQuantity);
            return cartDTO;
        }).collect(Collectors.toList());
    }

    @Override
    public CartDTO getCart(String emailId, Long cartId) {
        Cart cart = cartRepo.findCartByEmailAndCartId(emailId, cartId);
        if (cart == null) {
            throw new ResourceNotFoundException("Cart", "cartId", cartId);
        }

        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
        List<ProductDTO> products = cart.getCartItems().stream()
                .map(item -> {
                    ProductDTO productDTO = modelMapper.map(item.getProduct(), ProductDTO.class);
                    productDTO.setCartItemQuantity(item.getQuantity() != null ? item.getQuantity() : 0);
                    productDTO.setStock(item.getProduct().getQuantity() != null ? item.getProduct().getQuantity() : 0);
                    return productDTO;
                }).collect(Collectors.toList());
        cartDTO.setProducts(products);
        int totalQuantity = cart.getCartItems().stream()
                .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                .sum();
        cartDTO.setQuantity(totalQuantity);
        return cartDTO;
    }

    @Override
    public void updateProductInCarts(Long cartId, Long productId) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);
        if (cartItem == null) {
            throw new APIException("Product " + product.getProductName() + " not available in the cart!!!");
        }

        double cartPrice = cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity());
        cartItem.setProductPrice(product.getSpecialPrice());
        cart.setTotalPrice(cartPrice + (cartItem.getProductPrice() * cartItem.getQuantity()));
        cartItemRepo.save(cartItem);
    }

    @Override
    public CartDTO updateProductQuantityInCart(Long cartId, Long productId, Integer quantity) {
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart", "cartId", cartId));
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productId", productId));

        if (product.getQuantity() == null || product.getQuantity() == 0) {
            throw new APIException(product.getProductName() + " is not available");
        }

        if (product.getQuantity() < quantity) {
            throw new APIException("Please, make an order of the " + product.getProductName()
                    + " less than or equal to the quantity " + product.getQuantity() + ".");
        }

        CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);
        if (cartItem == null) {
            throw new APIException("Product " + product.getProductName() + " not available in the cart!!!");
        }

        double cartPrice = cart.getTotalPrice() - (cartItem.getProductPrice() * cartItem.getQuantity());
        product.setQuantity(product.getQuantity() + cartItem.getQuantity() - quantity);
        cartItem.setProductPrice(product.getSpecialPrice());
        cartItem.setQuantity(quantity);
        cartItem.setDiscount(product.getDiscount());
        cart.setTotalPrice(cartPrice + (cartItem.getProductPrice() * quantity));
        cartItemRepo.save(cartItem);

        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
        List<ProductDTO> productDTOS = cart.getCartItems().stream()
                .map(item -> {
                    ProductDTO productDTO = modelMapper.map(item.getProduct(), ProductDTO.class);
                    productDTO.setCartItemQuantity(item.getQuantity() != null ? item.getQuantity() : 0);
                    productDTO.setStock(item.getProduct().getQuantity() != null ? item.getProduct().getQuantity() : 0);
                    return productDTO;
                }).collect(Collectors.toList());
        cartDTO.setProducts(productDTOS);
        int totalQuantity = cart.getCartItems().stream()
                .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                .sum();
        cartDTO.setQuantity(totalQuantity);
        return cartDTO;
    }

    @Override
    public String deleteProductFromCart(Long cartId, Long productId) {
        logger.info("Attempting to delete product {} from cart {}", productId, cartId);
        Cart cart = cartRepo.findById(cartId)
                .orElseThrow(() -> {
                    logger.error("Cart not found for cartId {}", cartId);
                    return new ResourceNotFoundException("Cart", "cartId", cartId);
                });

        CartItem cartItem = cartItemRepo.findCartItemByProductIdAndCartId(cartId, productId);
        if (cartItem == null) {
            logger.error("CartItem not found for cartId {} and productId {}", cartId, productId);
            throw new ResourceNotFoundException("Product", "productId", productId);
        }

        logger.info("Found CartItem: cartItemId={}, cartId={}, productId={}, quantity={}",
                cartItem.getCartItemId(), cartId, productId, cartItem.getQuantity());

        // Cập nhật totalPrice của Cart
        double itemTotal = cartItem.getProductPrice() * (cartItem.getQuantity() != null ? cartItem.getQuantity() : 0);
        cart.setTotalPrice(cart.getTotalPrice() - itemTotal);
        logger.info("Updated cart totalPrice: {}", cart.getTotalPrice());

        // Cập nhật quantity của Product
        Product product = cartItem.getProduct();
        int cartItemQuantity = cartItem.getQuantity() != null ? cartItem.getQuantity() : 0;
        product.setQuantity(product.getQuantity() + cartItemQuantity);
        logger.info("Updated product quantity: productId={}, newQuantity={}",
                product.getProductId(), product.getQuantity());

        // Lưu Product
        productRepo.save(product);
        logger.info("Saved Product");

        // Xóa CartItem bằng truy vấn trực tiếp
        cartItemRepo.deleteCartItemByProductIdAndCartId(cartId, productId);
        cartItemRepo.flush(); // Đảm bảo lệnh DELETE được thực thi
        logger.info("Deleted CartItem: cartItemId={}, cartId={}, productId={}",
                cartItem.getCartItemId(), cartId, productId);

        // Lưu Cart để cập nhật totalPrice
        cartRepo.save(cart);
        logger.info("Saved Cart after deletion");

        return "Product " + product.getProductName() + " removed from the cart !!!";
    }

    @Override
    public CartDTO createNewCart(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        if (cartRepo.existsByUser(user)) {
            throw new APIException("User already has a cart");
        }

        Cart newCart = new Cart();
        newCart.setUser(user);
        newCart.setTotalPrice(0.0);
        Cart savedCart = cartRepo.save(newCart);

        return modelMapper.map(savedCart, CartDTO.class);
    }

    @Override
    public CartDTO getCartByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Cart cart = cartRepo.findByUser(user);
        if (cart == null) {
            return new CartDTO(null, "Cart not found");
        }
        CartDTO cartDTO = modelMapper.map(cart, CartDTO.class);
        List<ProductDTO> products = cart.getCartItems().stream()
                .map(item -> {
                    ProductDTO productDTO = modelMapper.map(item.getProduct(), ProductDTO.class);
                    productDTO.setCartItemQuantity(item.getQuantity() != null ? item.getQuantity() : 0);
                    productDTO.setStock(item.getProduct().getQuantity() != null ? item.getProduct().getQuantity() : 0);
                    return productDTO;
                }).collect(Collectors.toList());
        cartDTO.setProducts(products);
        int totalQuantity = cart.getCartItems().stream()
                .mapToInt(item -> item.getQuantity() != null ? item.getQuantity() : 0)
                .sum();
        cartDTO.setQuantity(totalQuantity);
        return cartDTO;
    }
}