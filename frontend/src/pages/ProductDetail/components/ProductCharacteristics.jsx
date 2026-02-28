import React, { useState } from 'react';

const ProductCharacteristics = ({ product }) => {
    const [expandedSection, setExpandedSection] = useState('general');

    // Extract attributes from product object
    // Attributes could be in product.attributes, product.productAttributes, or as individual fields
    const getAttributes = () => {
        if (!product) return [];
        
        console.log('Product object:', product);
        
        // Check various possible attribute locations
        let attrs = product.attributes || product.productAttributes || product.attrs || [];
        
        // If no nested attributes found, try to build from product fields
        if (!Array.isArray(attrs) || attrs.length === 0) {
            const builtAttrs = [];
            if (product.category) builtAttrs.push({ attribute_key: 'Category', attribute_value: product.category });
            if (product.skuCode) builtAttrs.push({ attribute_key: 'SKU Code', attribute_value: product.skuCode });
            if (product.price) builtAttrs.push({ attribute_key: 'Price', attribute_value: `$${product.price}` });
            return builtAttrs;
        }
        
        return attrs;
    };

    const attributes = getAttributes();

    const toggleSection = (section) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    const characteristicsConfig = {
        general: {
            title: 'Product Characteristics',
            icon: '📋',
            details: attributes && attributes.length > 0 
                ? attributes.map(attr => ({
                    label: attr.attribute_key || attr.attributeKey || 'Unknown',
                    value: attr.attribute_value || attr.attributeValue || 'N/A'
                }))
                : []
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <h2 style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: 'var(--color-primary)',
                marginBottom: '1rem'
            }}>
                Product Characteristics
            </h2>

            {attributes.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-light)' }}>
                    No characteristics available
                </div>
            ) : (
                Object.entries(characteristicsConfig).map(([key, section]) => (
                    section.details.length > 0 && (
                        <div
                            key={key}
                            style={{
                                backgroundColor: 'var(--color-card)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}
                        >
                            {/* Section Header */}
                            <div
                                onClick={() => toggleSection(key)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    backgroundColor: expandedSection === key 
                                        ? 'var(--color-bg)' 
                                        : 'var(--color-card)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    transition: 'background-color 0.3s ease',
                                    borderBottom: expandedSection === key 
                                        ? '1px solid var(--color-border)' 
                                        : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = expandedSection === key 
                                        ? 'var(--color-bg)' 
                                        : 'var(--color-card)';
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <span style={{ fontSize: '1.5rem' }}>{section.icon}</span>
                                    <h3 style={{
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        color: 'var(--color-primary)',
                                        margin: 0
                                    }}>
                                        {section.title}
                                    </h3>
                                </div>
                                <span style={{
                                    fontSize: '1.2rem',
                                    color: 'var(--color-text-light)',
                                    transition: 'transform 0.3s ease',
                                    transform: expandedSection === key ? 'rotate(180deg)' : 'rotate(0)'
                                }}>
                                    ▼
                                </span>
                            </div>

                            {/* Section Content */}
                            {expandedSection === key && section.details.length > 0 && (
                                <div style={{
                                    padding: '1.5rem',
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                                    gap: '1.5rem'
                                }}>
                                    {section.details.map((detail, index) => (
                                        <div key={index}>
                                            <p style={{
                                                color: 'var(--color-text-light)',
                                                fontSize: '0.9rem',
                                                marginBottom: '0.3rem',
                                                fontWeight: '500'
                                            }}>
                                                {detail.label}
                                            </p>
                                            <p style={{
                                                color: 'var(--color-primary)',
                                                fontSize: '1rem',
                                                fontWeight: '600'
                                            }}>
                                                {detail.value}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                ))
            )}
        </div>
    );
};

export default ProductCharacteristics;
