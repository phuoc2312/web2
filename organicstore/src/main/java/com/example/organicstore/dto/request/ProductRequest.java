package com.example.organicstore.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductRequest {
    @NotBlank
    private String name;
    
    private String slug;
    
    private String description;
    
    @NotNull
    @Positive
    private BigDecimal price;
    
    private Integer discount; // Không cần giá trị mặc định, có thể xử lý ở backend
    
    private String imageUrl;
    
    private boolean isNew;
    
    private boolean inStock;
    
    @NotNull
    private Long categoryId;
    
    private Integer stockQuantity;

    private String sku;

    private String unit;  
    
    private boolean featured;  
    
    private List<String> images; // Thêm danh sách URL ảnh để tránh lỗi getImages()
}
