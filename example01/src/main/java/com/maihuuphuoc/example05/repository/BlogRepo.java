package com.maihuuphuoc.example05.repository;

import com.maihuuphuoc.example05.entity.Blog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface BlogRepo extends JpaRepository<Blog, Long> {
    Page<Blog> findAll(Pageable pageable);
    Optional<Blog> findByTitle(String title);
}