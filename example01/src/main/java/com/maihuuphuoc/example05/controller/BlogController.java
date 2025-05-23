package com.maihuuphuoc.example05.controller;

import com.maihuuphuoc.example05.payloads.BlogDTO;
import com.maihuuphuoc.example05.payloads.BlogResponse;
import com.maihuuphuoc.example05.service.BlogService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
@CrossOrigin(origins = "*")
public class BlogController {

    @Autowired
    private BlogService blogService;

    @PostMapping("/admin/blogs")
    public ResponseEntity<BlogDTO> createBlog(@RequestBody BlogDTO blogDTO, Authentication auth) {
        BlogDTO savedBlogDTO = blogService.createBlog(blogDTO, auth.getName());
        return new ResponseEntity<>(savedBlogDTO, HttpStatus.CREATED);
    }

    @GetMapping("/public/blogs/{id}")
    public ResponseEntity<BlogDTO> getBlogById(@PathVariable Long id) {
        BlogDTO blogDTO = blogService.getBlogById(id);
        return new ResponseEntity<>(blogDTO, HttpStatus.OK);
    }

    @GetMapping("/public/blogs")
    public ResponseEntity<BlogResponse> getAllBlogs(
            @RequestParam(name = "pageNumber", defaultValue = "0", required = false) Integer pageNumber,
            @RequestParam(name = "pageSize", defaultValue = "10", required = false) Integer pageSize,
            @RequestParam(name = "sortBy", defaultValue = "id", required = false) String sortBy,
            @RequestParam(name = "sortOrder", defaultValue = "asc", required = false) String sortOrder) {
        BlogResponse blogResponse = blogService.getAllBlogs(pageNumber, pageSize, sortBy, sortOrder);
        return new ResponseEntity<>(blogResponse, HttpStatus.OK);
    }

    @PutMapping("/admin/blogs/{id}")
    public ResponseEntity<BlogDTO> updateBlog(@PathVariable Long id, @RequestBody BlogDTO blogDTO) {
        BlogDTO updatedBlogDTO = blogService.updateBlog(id, blogDTO);
        return new ResponseEntity<>(updatedBlogDTO, HttpStatus.OK);
    }

    @DeleteMapping("/admin/blogs/{id}")
    public ResponseEntity<String> deleteBlog(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return new ResponseEntity<>("Blog deleted successfully", HttpStatus.OK);
    }
}