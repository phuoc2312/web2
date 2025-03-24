package com.example.organicstore.service;

import com.example.organicstore.dto.request.UpdateProfileRequest;
import com.example.organicstore.dto.request.UpdatePasswordRequest;
import com.example.organicstore.dto.response.UserResponse;
import com.example.organicstore.exception.ResourceNotFoundException;
import com.example.organicstore.model.ERole;
import com.example.organicstore.model.User;
import com.example.organicstore.repository.UserRepository;
import com.example.organicstore.security.services.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        return userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userDetails.getId()));
    }
    
    public boolean isCurrentUserAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getAuthorities().contains(new SimpleGrantedAuthority(ERole.ROLE_ADMIN.name()));
    }
    
    public UserResponse getCurrentUserProfile() {
        User user = getCurrentUser();
        return mapToUserResponse(user);
    }
    
    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest updateProfileRequest) {
        User user = getCurrentUser();
        
        // Check if email is already taken
        if (!user.getEmail().equals(updateProfileRequest.getEmail()) && 
                userRepository.existsByEmail(updateProfileRequest.getEmail())) {
            throw new RuntimeException("Email is already taken");
        }
        
        user.setFullName(updateProfileRequest.getFullName());
        user.setEmail(updateProfileRequest.getEmail());
        user.setPhone(updateProfileRequest.getPhone());
        
        User updatedUser = userRepository.save(user);
        return mapToUserResponse(updatedUser);
    }
    
    @Transactional
    public void updatePassword(UpdatePasswordRequest updatePasswordRequest) {
        User user = getCurrentUser();
        
        // Check if current password is correct
        if (!passwordEncoder.matches(updatePasswordRequest.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(updatePasswordRequest.getNewPassword()));
        userRepository.save(user);
    }
    
    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        
        // Set roles
        response.setRoles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .toList());
        
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        
        return response;
    }
}