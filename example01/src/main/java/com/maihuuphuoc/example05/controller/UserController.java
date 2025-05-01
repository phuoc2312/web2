package com.maihuuphuoc.example05.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.maihuuphuoc.example05.config.AppConstants;
import com.maihuuphuoc.example05.payloads.CartDTO;
import com.maihuuphuoc.example05.payloads.UserDTO;
import com.maihuuphuoc.example05.payloads.UserResponse;
import com.maihuuphuoc.example05.service.CartService;
import com.maihuuphuoc.example05.service.UserService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
public class UserController {

    @Autowired
    private UserService userService;
    @Autowired
    private CartService cartService;

    @GetMapping("/public/users/email/{email}")
    public ResponseEntity<UserDTO> getUserEmail(@PathVariable String email) {
        UserDTO user = userService.getUserByEmail(email);
        return new ResponseEntity<UserDTO>(user, HttpStatus.OK);
    }

    @GetMapping("/admin/users")
    public ResponseEntity<UserResponse> getUsers(
            @RequestParam(name = "pageNumber", defaultValue = AppConstants.PAGE_NUMBER, required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = AppConstants.PAGE_SIZE, required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = AppConstants.SORT_USERS_BY, required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = AppConstants.SORT_DIR, required = false) String sortOrder) {
        UserResponse userResponse = userService.getAllUsers(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(userResponse, HttpStatus.OK);
    }

    @GetMapping("/public/users/{userId}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long userId) {
        UserDTO user = userService.getUserById(userId);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("/public/users/{userId}")
    public ResponseEntity<UserDTO> updateUser(@RequestBody UserDTO userDTO, @PathVariable Long userId) {
        UserDTO updatedUser = userService.updateUser(userId, userDTO);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @DeleteMapping("/admin/users/{userId}")
    public ResponseEntity<String> deleteUser(@PathVariable Long userId) {

        String status = userService.deleteUser(userId);
        return new ResponseEntity<>(status, HttpStatus.OK);
    }

   
    @GetMapping("/public/users/{email}/cart")
    public ResponseEntity<CartDTO> getCartIdByEmail(@PathVariable String email) {
        UserDTO user = userService.getUserByEmail(email);
        CartDTO cart = cartService.getCartByEmail(email);
        if (cart.getCartId() == null) {
            return new ResponseEntity<>(new CartDTO(null, "Cart not found"), HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(cart, HttpStatus.OK);
    }
}