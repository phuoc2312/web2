package com.example.organicstore.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ContactRequest {
    @NotBlank
    @Size(max = 100)
    private String name;
    
    @NotBlank
    @Size(max = 100)
    @Email
    private String email;
    
    @Size(max = 15)
    private String phone;
    
    @NotBlank
    @Size(max = 200)
    private String subject;
    
    @NotBlank
    private String message;
}
