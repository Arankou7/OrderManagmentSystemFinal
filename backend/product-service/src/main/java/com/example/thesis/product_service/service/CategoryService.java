package com.example.thesis.product_service.service;

import com.example.thesis.product_service.dto.*;
import com.example.thesis.product_service.model.AttributeInputType;
import com.example.thesis.product_service.model.Category;
import com.example.thesis.product_service.model.CategoryAttributeDefinition;
import com.example.thesis.product_service.repository.CategoryRepository;
import com.example.thesis.product_service.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .sorted(Comparator.comparing(Category::getName, String.CASE_INSENSITIVE_ORDER))
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        String name = requireName(request.name());
        categoryRepository.findByNameIgnoreCase(name).ifPresent(existing -> {
            throw new IllegalArgumentException("A category with this name already exists.");
        });

        Category category = Category.builder()
                .name(name)
                .description(trimToNull(request.description()))
                .attributeDefinitions(new ArrayList<>())
                .build();
        addDefinitions(category, request.attributeDefinitions());
        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));
        String name = requireName(request.name());
        categoryRepository.findByNameIgnoreCase(name)
                .filter(other -> !other.getId().equals(id))
                .ifPresent(existing -> { throw new IllegalArgumentException("A category with this name already exists."); });
        if (!category.getName().equalsIgnoreCase(name) && productRepository.existsByCategoryIgnoreCase(category.getName())) {
            throw new IllegalArgumentException("A category used by products cannot be renamed.");
        }

        category.setName(name);
        category.setDescription(trimToNull(request.description()));
        category.getAttributeDefinitions().clear();
        addDefinitions(category, request.attributeDefinitions());
        return mapToResponse(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + id));
        if (productRepository.existsByCategoryIgnoreCase(category.getName())) {
            throw new IllegalArgumentException("This category is used by products and cannot be deleted.");
        }
        categoryRepository.delete(category);
    }

    private void addDefinitions(Category category, List<CategoryAttributeDefinitionRequest> definitions) {
        if (definitions == null) return;

        Set<String> seenNames = new HashSet<>();
        for (CategoryAttributeDefinitionRequest definition : definitions) {
            String name = requireName(definition.name());
            if (!seenNames.add(name.toLowerCase(Locale.ROOT))) {
                throw new IllegalArgumentException("Characteristic names must be unique within a category.");
            }
            AttributeInputType inputType = Objects.requireNonNull(definition.inputType(), "Characteristic input type is required.");
            List<String> allowedValues = normalizeOptions(definition.allowedValues());
            if (inputType == AttributeInputType.SELECT && allowedValues.isEmpty()) {
                throw new IllegalArgumentException("A select characteristic must have at least one allowed value.");
            }

            category.getAttributeDefinitions().add(CategoryAttributeDefinition.builder()
                    .attributeName(name)
                    .inputType(inputType)
                    .required(definition.required())
                    .allowedValues(allowedValues)
                    .category(category)
                    .build());
        }
    }

    private List<String> normalizeOptions(List<String> options) {
        if (options == null) return new ArrayList<>();
        return new ArrayList<>(options.stream()
                .map(this::trimToNull)
                .filter(Objects::nonNull)
                .distinct()
                .toList());
    }

    private CategoryResponse mapToResponse(Category category) {
        List<CategoryAttributeDefinitionResponse> definitions = category.getAttributeDefinitions().stream()
                .map(definition -> new CategoryAttributeDefinitionResponse(
                        definition.getId(), definition.getAttributeName(), definition.getInputType(), definition.isRequired(), definition.getAllowedValues()
                )).toList();
        return new CategoryResponse(category.getId(), category.getName(), category.getDescription(), definitions);
    }

    private String requireName(String value) {
        String name = trimToNull(value);
        if (name == null) throw new IllegalArgumentException("A name is required.");
        return name;
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
