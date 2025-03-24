package com.example.organicstore.service;

import com.example.organicstore.dto.request.ProductRequest;
import com.example.organicstore.dto.response.PagedResponse;
import com.example.organicstore.dto.response.ProductResponse;
import com.example.organicstore.exception.ResourceNotFoundException;
import com.example.organicstore.model.Category;
import com.example.organicstore.model.Product;
import com.example.organicstore.model.ProductImage;
import com.example.organicstore.repository.CategoryRepository;
import com.example.organicstore.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public PagedResponse<ProductResponse> getAllProducts(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.findAll(pageable);

        return createPagedResponse(products);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return mapToProductResponse(product);
    }

    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with slug: " + slug));
        return mapToProductResponse(product);
    }

    public PagedResponse<ProductResponse> getProductsByCategory(Long categoryId, int page, int size, String sortBy,
            String sortDir) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));

        Sort sort = sortDir.equalsIgnoreCase(Sort.Direction.ASC.name()) ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Product> products = productRepository.findByCategory(category, pageable);

        return createPagedResponse(products);
    }

    public PagedResponse<ProductResponse> getFeaturedProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByIsFeatured(true, pageable);

        return createPagedResponse(products);
    }

    public PagedResponse<ProductResponse> getProductsOnSale(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.findByDiscountGreaterThan(0, pageable);

        return createPagedResponse(products);
    }

    public PagedResponse<ProductResponse> getNewProducts(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        // Giả sử sản phẩm mới là những sản phẩm được thêm trong 30 ngày gần đây
        LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
        Page<Product> products = productRepository.findByCreatedAtAfter(thirtyDaysAgo, pageable);

        return createPagedResponse(products);
    }

    public PagedResponse<ProductResponse> searchProducts(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productRepository.search(keyword, pageable);

        return createPagedResponse(products);
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest productRequest) {
        if (productRepository.existsBySlug(productRequest.getSlug())) {
            throw new RuntimeException("Slug already exists");
        }

        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + productRequest.getCategoryId()));

        Product product = new Product();
        product.setName(productRequest.getName());
        product.setSlug(productRequest.getSlug());
        product.setDescription(productRequest.getDescription());
        if (productRequest.getPrice() == null) {
            throw new IllegalArgumentException("Price cannot be null");
        }
        product.setPrice(productRequest.getPrice());

        product.setDiscount(productRequest.getDiscount());

        // Calculate discounted price if discount > 0
        if (productRequest.getDiscount() > 0) {
            BigDecimal discountAmount = product.getPrice()
                    .multiply(BigDecimal.valueOf(productRequest.getDiscount()))
                    .divide(BigDecimal.valueOf(100));
            product.setDiscountedPrice(product.getPrice().subtract(discountAmount));
        } else {
            product.setDiscountedPrice(product.getPrice());
        }

        product.setStockQuantity(productRequest.getStockQuantity());
        product.setSku(productRequest.getSku());
        product.setUnit(productRequest.getUnit());
        product.setNew(productRequest.isNew());
        product.setFeatured(productRequest.isFeatured());
        product.setCategory(category);

        // Add product images
        if (productRequest.getImages() != null && !productRequest.getImages().isEmpty()) {
            product.getImages().clear(); // Xóa ảnh cũ nếu có

            for (int i = 0; i < productRequest.getImages().size(); i++) {
                ProductImage image = new ProductImage();
                image.setImageUrl(productRequest.getImages().get(i));
                image.setMain(i == 0); // Ảnh đầu tiên là ảnh chính
                image.setProduct(product);
                product.getImages().add(image); // Thêm vào danh sách có sẵn
            }
        }

        Product savedProduct = productRepository.save(product);
        return mapToProductResponse(savedProduct);
    }

    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest productRequest) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        if (!product.getSlug().equals(productRequest.getSlug()) &&
                productRepository.existsBySlug(productRequest.getSlug())) {
            throw new RuntimeException("Slug already exists");
        }

        Category category = categoryRepository.findById(productRequest.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + productRequest.getCategoryId()));

        product.setName(productRequest.getName());
        product.setSlug(productRequest.getSlug());
        product.setDescription(productRequest.getDescription());
        if (productRequest.getPrice() == null) {
            throw new IllegalArgumentException("Price cannot be null");
        }
        product.setPrice(productRequest.getPrice());
        product.setDiscount(productRequest.getDiscount());

        // Calculate discounted price if discount > 0
        if (productRequest.getDiscount() > 0) {
            BigDecimal discountAmount = product.getPrice()
                    .multiply(BigDecimal.valueOf(productRequest.getDiscount()))
                    .divide(BigDecimal.valueOf(100));
            product.setDiscountedPrice(product.getPrice().subtract(discountAmount));
        } else {
            product.setDiscountedPrice(product.getPrice());
        }

        product.setStockQuantity(productRequest.getStockQuantity());
        product.setSku(productRequest.getSku());
        product.setUnit(productRequest.getUnit());
        product.setNew(productRequest.isNew());
        product.setFeatured(productRequest.isFeatured());
        product.setCategory(category);

        // Update product images
        if (productRequest.getImages() != null && !productRequest.getImages().isEmpty()) {
            // Clear existing images
            product.getImages().clear();

            // Add new images
            List<ProductImage> images = new ArrayList<>();
            for (int i = 0; i < productRequest.getImages().size(); i++) {
                ProductImage image = new ProductImage();
                image.setImageUrl(productRequest.getImages().get(i));
                image.setMain(i == 0); // First image is main
                image.setProduct(product);
                images.add(image);
            }
            product.getImages().addAll(images);

        }

        Product updatedProduct = productRepository.save(product);
        return mapToProductResponse(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        productRepository.delete(product);
    }

    private PagedResponse<ProductResponse> createPagedResponse(Page<Product> products) {
        List<ProductResponse> content = products.getContent().stream()
                .map(this::mapToProductResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                products.getNumber(),
                products.getSize(),
                products.getTotalElements(),
                products.getTotalPages(),
                products.isLast());
    }

    private ProductResponse mapToProductResponse(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSlug(product.getSlug());
        response.setDescription(product.getDescription());
        response.setPrice(product.getPrice().toString());
        response.setDiscount(product.getDiscount());
        response.setDiscountedPrice(
                product.getDiscountedPrice() != null ? product.getDiscountedPrice().toString() : null);
        response.setStock(product.getStockQuantity());
        response.setSku(product.getSku());
        response.setUnit(product.getUnit());
        response.setNew(product.isNew());
        response.setFeatured(product.isFeatured());

        // Set category info
        response.setCategoryId(product.getCategory().getId());
        response.setCategoryName(product.getCategory().getName());
        response.setCategorySlug(product.getCategory().getSlug());

        // Set images
        if (product.getImages() != null && !product.getImages().isEmpty()) {
            List<String> imageUrls = product.getImages().stream()
                    .map(ProductImage::getImageUrl)
                    .collect(Collectors.toList());
            response.setImages(imageUrls);

            // Set main image
            product.getImages().stream()
                    .filter(ProductImage::isMain)
                    .findFirst()
                    .ifPresent(image -> response.setMainImage(image.getImageUrl()));
        }

        response.setCreatedAt(product.getCreatedAt());
        response.setUpdatedAt(product.getUpdatedAt());

        return response;
    }
}