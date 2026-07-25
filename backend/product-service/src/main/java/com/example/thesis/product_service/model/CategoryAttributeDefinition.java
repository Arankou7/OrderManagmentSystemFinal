package com.example.thesis.product_service.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "category_attribute_definitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryAttributeDefinition {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(updatable = false, nullable = false)
    private UUID id;

    @Column(nullable = false)
    private String attributeName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttributeInputType inputType;

    @Column(nullable = false)
    private boolean required;

    @ElementCollection
    @CollectionTable(name = "category_attribute_options", joinColumns = @JoinColumn(name = "definition_id"))
    @Column(name = "option_value", nullable = false)
    @OrderColumn(name = "display_order")
    @Builder.Default
    private List<String> allowedValues = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
}
