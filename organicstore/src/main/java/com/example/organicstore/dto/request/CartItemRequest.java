package com.example.organicstore.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartItemRequest {
    @NotNull
    private Long productId;
    
    @NotNull
    @Min(1)
    private Integer quantity = 1;
}