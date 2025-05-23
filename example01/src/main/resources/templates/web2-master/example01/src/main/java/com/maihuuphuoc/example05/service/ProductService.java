package com.maihuuphuoc.example05.service;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import org.springframework.web.multipart.MultipartFile;
import com.maihuuphuoc.example05.entity.Product;
import com.maihuuphuoc.example05.payloads.ProductDTO;
import com.maihuuphuoc.example05.payloads.ProductResponse;

public interface ProductService {
        ProductResponse getPromotionProducts(int pageNumber, int pageSize, String sortBy, String sortOrder);

        ProductDTO addProduct(Long categoryId, Product product);

        ProductResponse getAllProducts(Integer pageNumber, Integer pageSize, String sortBy, String sortOrder);

        ProductResponse searchByCategory(Long categoryId, Integer pageNumber, Integer pageSize, String sortBy,
                        String sortOrder);

        ProductDTO updateProduct(Long productId, Product product);

        ProductDTO updateProductImage(Long productId, MultipartFile image) throws IOException;

        public InputStream getProductImage(String fileName) throws FileNotFoundException;

        ProductResponse searchProductByKeyword(String keyword, Long categoryId, Integer pageNumber, Integer pageSize,
                        String sortBy,
                        String sortOrder);

        String deleteProduct(Long productId);

        ProductDTO getProductById(Long productId);
}
