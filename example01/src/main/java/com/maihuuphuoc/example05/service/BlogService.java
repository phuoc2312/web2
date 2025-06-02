package com.maihuuphuoc.example05.service;

import com.maihuuphuoc.example05.payloads.BlogDTO;
import com.maihuuphuoc.example05.payloads.BlogResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.InputStream;

public interface BlogService {
    BlogDTO createBlog(BlogDTO blogDTO, String userEmail, MultipartFile image);
    BlogDTO getBlogById(Long id);
    BlogResponse getAllBlogs(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    BlogDTO updateBlog(Long id, BlogDTO blogDTO);
    BlogDTO updateBlogImage(Long id, MultipartFile image);
    void deleteBlog(Long id);
    InputStream getBlogImage(String fileName) throws FileNotFoundException;
}