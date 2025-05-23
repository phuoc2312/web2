package com.maihuuphuoc.example05.payloads;

import lombok.Data;

@Data
public class ProductDTO {
    private Long productId;
    private String productName;
    private String image;
    private String description;
    private Integer stock; // Số lượng tồn kho (từ bảng products)
    private Integer cartItemQuantity; // Số lượng trong giỏ hàng (từ bảng cart_items)
    private String quantity; // Mã sản phẩm (từ bảng products)
    private Double price;
    private Integer discount;
    private Double specialPrice;
    private CategoryDTO category;
}