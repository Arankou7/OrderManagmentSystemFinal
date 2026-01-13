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

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
@Slf4j
public class ProductService {
    private final ProductRepository productRepository;

    public ProductResponse createProduct(ProductRequest request) {

        // 1. Generate a meaningful SKU
        String skuCode = generateSku(request.name(), request.attributes());

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .category(request.category())
                .status(request.status())
                .skuCode(skuCode) // <--- Set the readable SKU here
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
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.getCategory(),
                product.getStatus(),
                product.getAttributes()
                        .stream()
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

    private String generateSku(String productName, List<ProductAttributeRequest> attributes) {
        String namePart = productName.replace(" ", "-").toUpperCase();

        String variantPart = "";

        if (attributes != null && !attributes.isEmpty()) {
            variantPart = "-" + attributes.getFirst().value().replace(" ", "-").toUpperCase();
        }

        String randomSuffix = "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        return namePart + variantPart + randomSuffix;
    }

    public ProductResponse getProductBySku(String skuCode) {
        Product product = productRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new RuntimeException("Product not found with SKU: " + skuCode));

        return mapToResponse(product);
    }
}
