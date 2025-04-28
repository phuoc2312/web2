package com.maihuuphuoc.example05.controller;

import com.maihuuphuoc.example05.payloads.BlogDTO;
import com.maihuuphuoc.example05.payloads.BlogResponse;
import com.maihuuphuoc.example05.service.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class BlogController {
    @Autowired
    private BlogService blogService;

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/blogs")
    public ResponseEntity<BlogDTO> createBlog(@RequestBody BlogDTO blogDTO, Authentication auth) {
        return ResponseEntity.ok(blogService.createBlog(blogDTO, auth.getName()));
    }

    @GetMapping("/public/blogs/{id}")
    public ResponseEntity<BlogDTO> getBlogById(@PathVariable Long id) {
        return ResponseEntity.ok(blogService.getBlogById(id));
    }

    @GetMapping("/public/blogs")
    public ResponseEntity<BlogResponse> getAllBlogs(
            @RequestParam(defaultValue = "0") Integer pageNumber,
            @RequestParam(defaultValue = "10") Integer pageSize,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {
        return ResponseEntity.ok(blogService.getAllBlogs(pageNumber, pageSize, sortBy, sortOrder));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/blogs/{id}")
    public ResponseEntity<BlogDTO> updateBlog(@PathVariable Long id, @RequestBody BlogDTO blogDTO) {
        return ResponseEntity.ok(blogService.updateBlog(id, blogDTO));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/blogs/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build();
    }
}