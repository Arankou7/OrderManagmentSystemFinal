package com.example.thesis.product_service.service;

import com.example.thesis.product_service.dto.ProductAttributeRequest;
import com.example.thesis.product_service.dto.ProductAttributeResponse;
import com.example.thesis.product_service.dto.ProductRequest;
import com.example.thesis.product_service.dto.ProductResponse;
import com.example.thesis.product_service.dto.RelatedProductResponse;
import com.example.thesis.product_service.model.Product;
import com.example.thesis.product_service.model.ProductAttribute;
import com.example.thesis.product_service.model.ProductImage;
import com.example.thesis.product_service.model.ProductStatus;
import com.example.thesis.product_service.model.AttributeInputType;
import com.example.thesis.product_service.model.Category;
import com.example.thesis.product_service.model.CategoryAttributeDefinition;
import com.example.thesis.product_service.repository.CategoryRepository;
import com.example.thesis.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@RequiredArgsConstructor
@Service
@Slf4j
public class ProductService {
    private static final int MAX_RELATED_PRODUCTS = 12;
    private static final Pattern WORD_SEPARATOR = Pattern.compile("[^a-z0-9]+", Pattern.CASE_INSENSITIVE);
    private static final Set<String> STOP_WORDS = Set.of("and", "the", "for", "with", "from", "this", "that");

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {

        String skuCode = generateSku();
        Category category = validateCharacteristics(request);

        Product product = Product.builder()
                .name(request.name())
                .description(request.description())
                .price(request.price())
                .category(category.getName())
                .status(request.status())
                .skuCode(skuCode)
                .attributes(new ArrayList<>())
                .images(new ArrayList<>())
                .build();

        addAttributes(product, request.attributes());
        addImages(product, request.imageUrls());

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
                                .toList(),
                product.getImages() == null ? new ArrayList<>() :
                        product.getImages().stream()
                                .map(ProductImage::getImageUrl)
                                .toList()
        );
    }


    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ProductResponse updateProduct(UUID id, ProductRequest productRequest) {
        Category category = validateCharacteristics(productRequest);
        return productRepository.findById(id)
                .map(product -> {
                    product.setName(productRequest.name());
                    product.setDescription(productRequest.description());
                    product.setPrice(productRequest.price());
                    product.setCategory(category.getName());
                    product.setStatus(productRequest.status());
                    product.getAttributes().clear();
                    product.getImages().clear();
                    addAttributes(product, productRequest.attributes());
                    addImages(product, productRequest.imageUrls());

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

    /**
     * Ranks catalogue products using explainable content-based similarity:
     * category (40 points), matching specifications (up to 25), name tokens
     * (up to 15), and price proximity (up to 20). A fallback result is kept
     * so a newly created product is never left with an empty related section.
     */
    @Transactional(readOnly = true)
    public List<RelatedProductResponse> getRelatedProducts(UUID productId, int requestedLimit) {
        Product source = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        int limit = Math.max(1, Math.min(requestedLimit, MAX_RELATED_PRODUCTS));

        return productRepository.findAll().stream()
                .filter(candidate -> !candidate.getId().equals(source.getId()))
                .filter(candidate -> candidate.getStatus() == ProductStatus.ACTIVE)
                .map(candidate -> scoreRelatedProduct(source, candidate))
                .sorted(Comparator
                        .comparingInt(RelatedCandidate::score).reversed()
                        .thenComparing(candidate -> candidate.product().getUpdatedAt(), Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(candidate -> candidate.product().getName(), String.CASE_INSENSITIVE_ORDER))
                .limit(limit)
                .map(candidate -> new RelatedProductResponse(
                        mapToResponse(candidate.product()),
                        candidate.score(),
                        candidate.reasons()
                ))
                .toList();
    }

    private void addAttributes(Product product, List<ProductAttributeRequest> attributes) {
        if (attributes == null) {
            return;
        }

        attributes.stream()
                .filter(attr -> attr.key() != null && !attr.key().isBlank()
                        && attr.value() != null && !attr.value().isBlank())
                .forEach(attr -> product.getAttributes().add(ProductAttribute.builder()
                        .attributeKey(attr.key().trim())
                        .attributeValue(attr.value().trim())
                        .product(product)
                        .build()));
    }

    private void addImages(Product product, List<String> imageUrls) {
        if (imageUrls == null) {
            return;
        }

        imageUrls.stream()
                .filter(url -> url != null && !url.isBlank())
                .map(String::trim)
                .forEach(url -> product.getImages().add(ProductImage.builder()
                        .imageUrl(url)
                        .product(product)
                        .build()));
    }

    /** Validates product attributes against the selected category template. */
    private Category validateCharacteristics(ProductRequest request) {
        if (request.category() == null || request.category().isBlank()) {
            throw new IllegalArgumentException("A category is required.");
        }
        Category category = categoryRepository.findByNameIgnoreCase(request.category().trim())
                .orElseThrow(() -> new IllegalArgumentException("Select a category created in the category manager."));

        Map<String, String> submitted = new HashMap<>();
        if (request.attributes() != null) {
            for (ProductAttributeRequest attribute : request.attributes()) {
                if (attribute.key() == null || attribute.value() == null || attribute.key().isBlank() || attribute.value().isBlank()) {
                    throw new IllegalArgumentException("Characteristics must have both a name and value.");
                }
                String key = normalize(attribute.key());
                if (submitted.put(key, attribute.value().trim()) != null) {
                    throw new IllegalArgumentException("A characteristic can only be included once.");
                }
            }
        }

        Map<String, CategoryAttributeDefinition> definitions = new HashMap<>();
        for (CategoryAttributeDefinition definition : category.getAttributeDefinitions()) {
            definitions.put(normalize(definition.getAttributeName()), definition);
            if (definition.isRequired() && !submitted.containsKey(normalize(definition.getAttributeName()))) {
                throw new IllegalArgumentException("Missing required characteristic: " + definition.getAttributeName());
            }
        }

        for (Map.Entry<String, String> characteristic : submitted.entrySet()) {
            CategoryAttributeDefinition definition = definitions.get(characteristic.getKey());
            if (definition == null) {
                throw new IllegalArgumentException("Characteristic is not allowed for this category: " + characteristic.getKey());
            }
            validateCharacteristicValue(definition, characteristic.getValue());
        }
        return category;
    }

    private void validateCharacteristicValue(CategoryAttributeDefinition definition, String value) {
        if (definition.getInputType() == AttributeInputType.NUMBER) {
            try {
                new BigDecimal(value);
            } catch (NumberFormatException exception) {
                throw new IllegalArgumentException(definition.getAttributeName() + " must be a number.");
            }
        }
        if (definition.getInputType() == AttributeInputType.SELECT) {
            boolean isAllowed = definition.getAllowedValues().stream()
                    .anyMatch(option -> option.equalsIgnoreCase(value));
            if (!isAllowed) {
                throw new IllegalArgumentException("Invalid value for " + definition.getAttributeName() + ".");
            }
        }
    }

    private RelatedCandidate scoreRelatedProduct(Product source, Product candidate) {
        int score = 0;
        List<String> reasons = new ArrayList<>();

        if (sameText(source.getCategory(), candidate.getCategory())) {
            score += 40;
            reasons.add("Same category");
        }

        int matchingSpecs = countMatchingSpecifications(source, candidate);
        if (matchingSpecs > 0) {
            score += Math.min(matchingSpecs * 12, 25);
            reasons.add(matchingSpecs == 1 ? "1 matching specification" : matchingSpecs + " matching specifications");
        }

        int matchingWords = countMatchingWords(source.getName(), candidate.getName());
        if (matchingWords > 0) {
            score += Math.min(matchingWords * 7, 15);
            reasons.add("Similar product name");
        }

        int priceScore = calculatePriceScore(source.getPrice(), candidate.getPrice());
        if (priceScore > 0) {
            score += priceScore;
            reasons.add("Similar price range");
        }

        if (reasons.isEmpty()) {
            reasons.add("Alternative from the catalogue");
        }

        return new RelatedCandidate(candidate, score, reasons);
    }

    private int countMatchingSpecifications(Product source, Product candidate) {
        Map<String, String> sourceAttributes = attributesByKey(source);
        Map<String, String> candidateAttributes = attributesByKey(candidate);
        return (int) sourceAttributes.entrySet().stream()
                .filter(entry -> entry.getValue().equals(candidateAttributes.get(entry.getKey())))
                .count();
    }

    private Map<String, String> attributesByKey(Product product) {
        Map<String, String> attributes = new HashMap<>();
        if (product.getAttributes() == null) {
            return attributes;
        }
        product.getAttributes().forEach(attribute -> {
            if (attribute.getAttributeKey() != null && attribute.getAttributeValue() != null) {
                attributes.put(normalize(attribute.getAttributeKey()), normalize(attribute.getAttributeValue()));
            }
        });
        return attributes;
    }

    private int countMatchingWords(String first, String second) {
        Set<String> firstWords = keywords(first);
        Set<String> secondWords = keywords(second);
        firstWords.retainAll(secondWords);
        return firstWords.size();
    }

    private Set<String> keywords(String value) {
        if (value == null) {
            return new HashSet<>();
        }
        Set<String> result = new HashSet<>();
        for (String word : WORD_SEPARATOR.split(normalize(value))) {
            if (word.length() >= 3 && !STOP_WORDS.contains(word)) {
                result.add(word);
            }
        }
        return result;
    }

    private int calculatePriceScore(BigDecimal sourcePrice, BigDecimal candidatePrice) {
        if (sourcePrice == null || candidatePrice == null || sourcePrice.signum() <= 0) {
            return 0;
        }
        BigDecimal relativeDifference = sourcePrice.subtract(candidatePrice).abs()
                .divide(sourcePrice, 4, java.math.RoundingMode.HALF_UP);
        if (relativeDifference.compareTo(new BigDecimal("0.10")) <= 0) return 20;
        if (relativeDifference.compareTo(new BigDecimal("0.25")) <= 0) return 12;
        if (relativeDifference.compareTo(new BigDecimal("0.50")) <= 0) return 5;
        return 0;
    }

    private boolean sameText(String first, String second) {
        return first != null && second != null && normalize(first).equals(normalize(second));
    }

    private String normalize(String value) {
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private record RelatedCandidate(Product product, int score, List<String> reasons) { }
}
