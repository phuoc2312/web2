package com.maihuuphuoc.example05.service.impl;

import com.maihuuphuoc.example05.entity.Blog;
import com.maihuuphuoc.example05.entity.User;
import com.maihuuphuoc.example05.exceptions.APIException;
import com.maihuuphuoc.example05.exceptions.ResourceNotFoundException;
import com.maihuuphuoc.example05.payloads.BlogDTO;
import com.maihuuphuoc.example05.payloads.BlogResponse;
import com.maihuuphuoc.example05.repository.BlogRepo;
import com.maihuuphuoc.example05.repository.UserRepo;
import com.maihuuphuoc.example05.service.BlogService;
import com.maihuuphuoc.example05.service.FileService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BlogServiceImpl implements BlogService {

    @Autowired
    private BlogRepo blogRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private FileService fileService;

    @Autowired
    private ModelMapper modelMapper;

    @Value("${project.image}")
    private String path;

    @Override
    public BlogDTO createBlog(BlogDTO blogDTO, String userEmail, MultipartFile image) {
        User author = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        if (blogRepo.findByTitle(blogDTO.getTitle()).isPresent()) {
            throw new APIException("Blog with title '" + blogDTO.getTitle() + "' already exists!");
        }
        Blog blog = modelMapper.map(blogDTO, Blog.class);
        blog.setAuthor(author);
        try {
            if (image != null && !image.isEmpty()) {
                String fileName = fileService.uploadImage(path, image);
                blog.setImage(fileName);
            } else {
                blog.setImage("default.png");
            }
        } catch (IOException e) {
            throw new APIException("Failed to upload image: " + e.getMessage());
        }
        Blog savedBlog = blogRepo.save(blog);
        BlogDTO savedBlogDTO = modelMapper.map(savedBlog, BlogDTO.class);
        savedBlogDTO.setAuthorEmail(author.getEmail());
        return savedBlogDTO;
    }

    @Override
    public BlogDTO getBlogById(Long id) {
        Blog blog = blogRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", id));
        BlogDTO blogDTO = modelMapper.map(blog, BlogDTO.class);
        blogDTO.setAuthorEmail(blog.getAuthor().getEmail());
        return blogDTO;
    }

    @Override
    public BlogResponse getAllBlogs(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder) {
        Sort sort = sortOrder.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        PageRequest pageable = PageRequest.of(pageNumber, pageSize, sort);
        Page<Blog> blogPage = blogRepo.findAll(pageable);
        if (blogPage.getContent().isEmpty()) {
            throw new APIException("No blogs found!");
        }
        List<BlogDTO> blogDTOs = blogPage.getContent().stream()
                .map(blog -> {
                    BlogDTO dto = modelMapper.map(blog, BlogDTO.class);
                    dto.setAuthorEmail(blog.getAuthor().getEmail());
                    return dto;
                })
                .collect(Collectors.toList());
        return new BlogResponse(
                blogDTOs,
                blogPage.getNumber(),
                blogPage.getSize(),
                blogPage.getTotalElements(),
                blogPage.getTotalPages(),
                blogPage.isLast()
        );
    }

    @Override
    public BlogDTO updateBlog(Long id, BlogDTO blogDTO) {
        Blog blog = blogRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", id));
        blog.setTitle(blogDTO.getTitle());
        blog.setContent(blogDTO.getContent());
        // Giữ nguyên image nếu không được cung cấp trong blogDTO
        if (blogDTO.getImage() != null) {
            blog.setImage(blogDTO.getImage());
        }
        Blog updatedBlog = blogRepo.save(blog);
        BlogDTO updatedBlogDTO = modelMapper.map(updatedBlog, BlogDTO.class);
        updatedBlogDTO.setAuthorEmail(blog.getAuthor().getEmail());
        return updatedBlogDTO;
    }

    @Override
    public BlogDTO updateBlogImage(Long id, MultipartFile image) {
        Blog blog = blogRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", id));
        try {
            if (image != null && !image.isEmpty()) {
                String fileName = fileService.uploadImage(path, image);
                blog.setImage(fileName);
            } else {
                throw new APIException("No image file provided!");
            }
        } catch (IOException e) {
            throw new APIException("Failed to upload image: " + e.getMessage());
        }
        Blog updatedBlog = blogRepo.save(blog);
        BlogDTO updatedBlogDTO = modelMapper.map(updatedBlog, BlogDTO.class);
        updatedBlogDTO.setAuthorEmail(blog.getAuthor().getEmail());
        return updatedBlogDTO;
    }

    @Override
    public void deleteBlog(Long id) {
        Blog blog = blogRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog", "id", id));
        blogRepo.delete(blog);
    }

    @Override
    public InputStream getBlogImage(String fileName) throws FileNotFoundException {
        return fileService.getResource(path, fileName);
    }
}