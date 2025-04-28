package com.maihuuphuoc.example05.service;

import com.maihuuphuoc.example05.payloads.BlogDTO;
import com.maihuuphuoc.example05.payloads.BlogResponse;

public interface BlogService {
    BlogDTO createBlog(BlogDTO blogDTO, String userEmail);
    BlogDTO getBlogById(Long id);
    BlogResponse getAllBlogs(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);
    BlogDTO updateBlog(Long id, BlogDTO blogDTO);
    void deleteBlog(Long id);
}