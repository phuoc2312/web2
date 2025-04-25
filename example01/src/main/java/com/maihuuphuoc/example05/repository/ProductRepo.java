package com.maihuuphuoc.example05.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.maihuuphuoc.example05.entity.Product;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {
    // Tìm kiếm theo tên sản phẩm với chuỗi ký tự bất kỳ
    Page<Product> findByProductNameContaining(String keyword, Pageable pageDetails);

    Page<Product> findByDiscountGreaterThan(int discount, Pageable pageable);

    // Tìm kiếm sản phẩm theo categoryId
    Page<Product> findByCategoryCategoryId(Long categoryId, Pageable pageable);
}