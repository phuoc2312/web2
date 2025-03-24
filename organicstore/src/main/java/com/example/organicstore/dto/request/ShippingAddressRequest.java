package com.example.organicstore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ShippingAddressRequest {
    @NotBlank
    @Size(max = 100)
    private String fullName;
    
    @NotBlank
    @Size(max = 15)
    private String phone;
    
    @NotBlank
    @Size(max = 255)
    private String addressLine1;
    
    @Size(max = 255)
    private String addressLine2;
    
    @NotBlank
    @Size(max = 100)
    private String city;
    
    @NotBlank
    @Size(max = 100)
    private String state;
    
    @NotBlank
    @Size(max = 10)
    private String postalCode;
    
    @NotBlank
    @Size(max = 100)
    private String country;

    // Getters and setters
    // ...
}