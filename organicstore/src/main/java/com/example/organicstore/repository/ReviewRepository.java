package com.example.organicstore.repository;

import com.example.organicstore.model.Product;
import com.example.organicstore.model.Review;
import com.example.organicstore.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByProduct(Product product, Pageable pageable);
    
    Page<Review> findByUser(User user, Pageable pageable);
    
    Optional<Review> findByProductAndUser(Product product, User user);
}