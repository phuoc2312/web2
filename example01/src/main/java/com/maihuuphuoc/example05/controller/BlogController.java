package com.maihuuphuoc.example05.controller;

import com.maihuuphuoc.example05.payloads.BlogDTO;
import com.maihuuphuoc.example05.payloads.BlogResponse;
import com.maihuuphuoc.example05.service.BlogService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.InputStream;

@RestController
@RequestMapping("/api")
@SecurityRequirement(name = "E-Commerce Application")
@CrossOrigin(origins = "*")
public class BlogController {

    @Autowired
    private BlogService blogService;

    @PostMapping(value = "/admin/blogs", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BlogDTO> createBlogWithoutImage(
            @RequestBody BlogDTO blogDTO,
            Authentication auth) {
        BlogDTO savedBlogDTO = blogService.createBlog(blogDTO, auth.getName(), null);
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

    @PutMapping(value = "/admin/blogs/{id}", consumes = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<BlogDTO> updateBlog(@PathVariable Long id, @RequestBody BlogDTO blogDTO) {
        BlogDTO updatedBlogDTO = blogService.updateBlog(id, blogDTO);
        return new ResponseEntity<>(updatedBlogDTO, HttpStatus.OK);
    }

    @PutMapping(value = "/admin/blogs/{id}/image", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<BlogDTO> updateBlogImage(@PathVariable Long id, @RequestParam("image") MultipartFile image) {
        BlogDTO updatedBlogDTO = blogService.updateBlogImage(id, image);
        return new ResponseEntity<>(updatedBlogDTO, HttpStatus.OK);
    }

    @DeleteMapping("/admin/blogs/{id}")
    public ResponseEntity<String> deleteBlog(@PathVariable Long id) {
        blogService.deleteBlog(id);
        return new ResponseEntity<>("Blog deleted successfully", HttpStatus.OK);
    }

    @GetMapping("/public/images/{fileName}")
    public ResponseEntity<InputStreamResource> getImage(@PathVariable String fileName) throws FileNotFoundException {
        InputStream imageStream = blogService.getBlogImage(fileName);
        HttpHeaders headers = new HttpHeaders();
        String contentType = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") ? "image/jpeg" : "image/png";
        headers.setContentType(MediaType.parseMediaType(contentType));
        headers.setContentDispositionFormData("inline", fileName);
        return new ResponseEntity<>(new InputStreamResource(imageStream), headers, HttpStatus.OK);
    }
}