package com.example.thesis.product_service.service;

import com.example.thesis.product_service.dto.ProductAttributeRequest;
import com.example.thesis.product_service.dto.ProductAttributeResponse;
import com.example.thesis.product_service.dto.ProductRequest;
import com.example.thesis.product_service.dto.ProductResponse;
import com.example.thesis.product_service.model.Product;
import com.example.thesis.product_service.model.ProductAttribute;
import com.example.thesis.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@RequiredArgsConstructor
@Service
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;

    public ProductResponse createProduct(ProductRequest request) {

        String skuCode = generateSku();

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .category(request.category())
                .status(request.status())
                .skuCode(skuCode)
                .attributes(new ArrayList<>())
                .build();

        if (request.attributes() != null) {
            request.attributes().forEach(attr -> {
                ProductAttribute attribute = ProductAttribute.builder()
                        .attributeKey(attr.key())
                        .attributeValue(attr.value())
                        .product(product)
                        .build();

                product.getAttributes().add(attribute);
            });
        }

        Product saved = productRepository.save(product);
        log.info("Product created with id={}", saved.getId());

        return mapToResponse(saved);
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getSkuCode(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory(),
                product.getStatus(),
                product.getAttributes() == null ? new ArrayList<>() :
                        product.getAttributes().stream()
                                .map(attr -> new ProductAttributeResponse(
                                        attr.getId(),
                                        attr.getAttributeKey(),
                                        attr.getAttributeValue()
                                ))
                                .toList()
        );
    }


    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ProductResponse updateProduct(UUID id, ProductRequest productRequest) {
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(productRequest.name());
                    product.setDescription(productRequest.description());
                    product.setPrice(productRequest.price());
                    product.setCategory(productRequest.category());
                    product.setStatus(productRequest.status());

                    Product updated = productRepository.save(product);

                    return mapToResponse(updated);
                })
                .orElseThrow(() -> new RuntimeException("Product not found: " + id));
    }

    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id).orElseThrow(()->new RuntimeException("Product not found: "+ id));
        productRepository.delete(product);
    }

    private String generateSku() {
        Random random = new Random();
        String newSku;
        do {
            int skuNumber = 100_000_000 + random.nextInt(900_000_000);
            newSku = String.valueOf(skuNumber);
        } while (productRepository.existsBySkuCode(newSku));
        return newSku;
    }

    public ProductResponse getProductBySku(String skuCode) {
        Product product = productRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + skuCode));

        return mapToResponse(product);
    }
}
