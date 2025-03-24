package com.example.organicstore.repository;

import com.example.organicstore.model.Category;
import com.example.organicstore.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySlug(String slug);

    Boolean existsBySlug(String slug);

    Page<Product> findByCategory(Category category, Pageable pageable);

    Page<Product> findByNameContaining(String name, Pageable pageable);

    Page<Product> findByIsFeatured(boolean isFeatured, Pageable pageable);

    Page<Product> findByDiscountGreaterThan(int discount, Pageable pageable);

    Page<Product> findByCreatedAtAfter(LocalDateTime createdAt, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.discount > 0")
    Page<Product> findProductsOnSale(Pageable pageable);

    Page<Product> findByIsNewTrue(Pageable pageable);

    @Query("SELECT p FROM Product p ORDER BY p.rating DESC")
    Page<Product> findTopRatedProducts(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Product> search(@Param("keyword") String keyword, Pageable pageable);

}