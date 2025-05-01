package com.maihuuphuoc.example05.payloads;

import java.util.ArrayList;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartDTO {
    private Long cartId;
    private Double totalPrice = 0.0;
    private List<ProductDTO> products = new ArrayList<>();
    private String message; // Thêm trường message để lưu thông điệp lỗi

    // Constructor cho trường hợp không tìm thấy giỏ hàng
    public CartDTO(Long cartId, String message) {
        this.cartId = cartId;
        this.message = message;
        this.totalPrice = 0.0;
        this.products = new ArrayList<>();
    }
}