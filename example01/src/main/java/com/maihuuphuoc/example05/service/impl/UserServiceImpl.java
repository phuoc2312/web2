package com.maihuuphuoc.example05.service.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.maihuuphuoc.example05.config.AppConstants;
import com.maihuuphuoc.example05.entity.Address;
import com.maihuuphuoc.example05.entity.Cart;
import com.maihuuphuoc.example05.entity.Role;
import com.maihuuphuoc.example05.entity.User;
import com.maihuuphuoc.example05.exceptions.APIException;
import com.maihuuphuoc.example05.exceptions.ResourceNotFoundException;
import com.maihuuphuoc.example05.payloads.AddressDTO;
import com.maihuuphuoc.example05.payloads.CartDTO;
import com.maihuuphuoc.example05.payloads.ProductDTO;
import com.maihuuphuoc.example05.payloads.UserDTO;
import com.maihuuphuoc.example05.payloads.UserResponse;
import com.maihuuphuoc.example05.repository.AddressRepo;
import com.maihuuphuoc.example05.repository.RoleRepo;
import com.maihuuphuoc.example05.repository.UserRepo;
import com.maihuuphuoc.example05.service.CartService;
import com.maihuuphuoc.example05.service.UserService;

import jakarta.transaction.Transactional;

@Transactional
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private AddressRepo addressRepo;

    @Autowired
    private CartService cartService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ModelMapper modelMapper;

    @Override
    public UserDTO registerUser(UserDTO userDTO) {
        try {
            // Map UserDTO to User entity
            User user = modelMapper.map(userDTO, User.class);

            // Create and associate Cart with User
            Cart cart = new Cart();
            cart.setUser(user);
            user.setCart(cart);

            // Assign default role to the user
            Role role = roleRepo.findById(AppConstants.USER_ID)
                    .orElseThrow(() -> new APIException("Role not found"));
            user.getRoles().add(role);

            // Fetch or create Address
            String country = userDTO.getAddress().getCountry();
            String state = userDTO.getAddress().getState();
            String city = userDTO.getAddress().getCity();
            String pincode = userDTO.getAddress().getPincode();
            String street = userDTO.getAddress().getStreet();
            String buildingName = userDTO.getAddress().getBuildingName();
            Address address = addressRepo.findByCountryAndStateAndCityAndPincodeAndStreetAndBuildingName(
                    country, state, city, pincode, street, buildingName);

            if (address == null) {
                address = new Address(country, state, city, pincode, street, buildingName);
                address = addressRepo.save(address);
            }

            // Associate Address with User
            user.setAddresses(List.of(address));

            // Save User and update Cart
            User registeredUser = userRepo.save(user);
            cart.setUser(registeredUser);

            // Map back to UserDTO
            userDTO = modelMapper.map(registeredUser, UserDTO.class);
            userDTO.setAddress(modelMapper.map(address, AddressDTO.class));

            return userDTO;

        } catch (DataIntegrityViolationException e) {
            throw new APIException("User already exists with emailId: " + userDTO.getEmail());
        }
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

        // Map Address
        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
            userDTO.setAddress(modelMapper.map(user.getAddresses().get(0), AddressDTO.class));
        }

        // Map Cart and Cart Items
        if (user.getCart() != null) {
            CartDTO cartDTO = modelMapper.map(user.getCart(), CartDTO.class);

            List<ProductDTO> products = user.getCart().getCartItems().stream()
                    .map(item -> modelMapper.map(item.getProduct(), ProductDTO.class))
                    .collect(Collectors.toList());

            cartDTO.setProducts(products);
            userDTO.setCart(cartDTO);
        }

        return userDTO;
    }

    @Override
    public UserDTO getUserById(Long userId) {
        // Find user by ID
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Map User entity to UserDTO
        UserDTO userDTO = modelMapper.map(user, UserDTO.class);

        // Map Address if present
        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
            userDTO.setAddress(modelMapper.map(user.getAddresses().get(0), AddressDTO.class));
        }

        // Map Cart and Cart Items if present
        if (user.getCart() != null) {
            CartDTO cartDTO = modelMapper.map(user.getCart(), CartDTO.class);

            List<ProductDTO> products = user.getCart().getCartItems().stream()
                    .map(item -> modelMapper.map(item.getProduct(), ProductDTO.class))
                    .collect(Collectors.toList());

            cartDTO.setProducts(products);
            userDTO.setCart(cartDTO);
        }

        return userDTO;
    }

    @Override
    public UserDTO updateUser(Long userId, UserDTO userDTO) {
        try {
            System.out.println("=== [LOG] userDTO nhận vào: " + userDTO);

            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            System.out.println(
                    "=== [LOG] User entity trước khi cập nhật: id=" + user.getUserId() + ", email=" + user.getEmail());
            if (userDTO.getEmail() != null) {
                user.setEmail(userDTO.getEmail());
            }
            user.setEmail(userDTO.getEmail());
            user.setLastName(userDTO.getLastName());
            user.setFirstName(userDTO.getFirstName());
            user.setMobileNumber(userDTO.getMobileNumber());
            System.out.println("=== [LOG] User sau khi set thông tin cơ bản: id=" + user.getUserId() + ", email="
                    + user.getEmail());

            if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
                System.out.println("=== [LOG] Đã cập nhật password");
            }

            if (userDTO.getAddress() != null) {
                Address address = modelMapper.map(userDTO.getAddress(), Address.class);
                // Lưu địa chỉ vào cơ sở dữ liệu trước
                address = addressRepo.save(address);
                List<Address> addresses = new ArrayList<>();
                addresses.add(address);
                user.setAddresses(addresses);
                System.out.println("=== [LOG] Đã cập nhật address: id=" + address.getAddressId() + ", street="
                        + address.getStreet());
            }

            if (userDTO.getCart() != null) {
                Cart cart = modelMapper.map(userDTO.getCart(), Cart.class);
                user.setCart(cart);
                System.out.println("=== [LOG] Đã cập nhật cart: id=" + cart.getCartId());
            }

            System.out.println(
                    "=== [LOG] User entity trước khi save: id=" + user.getUserId() + ", email=" + user.getEmail());

            User updatedUser = userRepo.save(user);

            UserDTO updatedUserDTO = modelMapper.map(updatedUser, UserDTO.class);

            if (updatedUser.getAddresses() != null && !updatedUser.getAddresses().isEmpty()) {
                updatedUserDTO.setAddress(modelMapper.map(updatedUser.getAddresses().get(0), AddressDTO.class));
            }

            if (updatedUser.getCart() != null) {
                CartDTO cartDTO = modelMapper.map(updatedUser.getCart(), CartDTO.class);

                List<ProductDTO> products = updatedUser.getCart().getCartItems().stream()
                        .map(item -> modelMapper.map(item.getProduct(), ProductDTO.class))
                        .collect(Collectors.toList());

                cartDTO.setProducts(products);
                updatedUserDTO.setCart(cartDTO);
            }

            System.out.println("=== [LOG] updateUser thành công, trả về userId: " + updatedUserDTO.getUserId());

            return updatedUserDTO;
        } catch (Exception e) {
            e.printStackTrace();
            throw new APIException("Error updating user with id: " + userId + " | " + e.getMessage());
        }
    }

    @Override
    public String deleteUser(Long userId) {
        try {
            // Check if user exists
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            // Delete user
            userRepo.delete(user);
            return "User with id " + userId + " deleted successfully";

        } catch (Exception e) {
            throw new APIException("Error deleting user with id: " + userId);
        }
    }

    @Override
    public UserResponse getAllUsers(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        try {
            // Create Pageable object for pagination and sorting
            Sort sort = Sort.by(sortOrder.equalsIgnoreCase("desc") ? Sort.Order.desc(sortBy) : Sort.Order.asc(sortBy));
            Pageable pageable = PageRequest.of(pageNumber, pageSize, sort);

            // Get paginated result
            Page<User> userPage = userRepo.findAll(pageable);

            // Convert page of users to DTOs
            List<UserDTO> userDTOs = userPage.getContent().stream()
                    .map(user -> {
                        UserDTO dto = modelMapper.map(user, UserDTO.class);
                        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
                            dto.setAddress(modelMapper.map(user.getAddresses().get(0), AddressDTO.class));
                        }
                        if (user.getCart() != null) {
                            CartDTO cartDTO = modelMapper.map(user.getCart(), CartDTO.class);
                            List<ProductDTO> products = user.getCart().getCartItems().stream()
                                    .map(item -> modelMapper.map(item.getProduct(), ProductDTO.class))
                                    .collect(Collectors.toList());
                            cartDTO.setProducts(products);
                            dto.setCart(cartDTO);
                        }
                        return dto;
                    })
                    .collect(Collectors.toList());

            // Return paginated user data
            return new UserResponse(userDTOs, userPage.getNumber(), userPage.getSize(), userPage.getTotalElements(),
                    pageSize, false);

        } catch (Exception e) {
            throw new APIException("Error retrieving users");
        }
    }
}
