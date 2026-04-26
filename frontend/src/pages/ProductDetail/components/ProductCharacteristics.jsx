import React, { useState } from 'react';

const ProductCharacteristics = ({ product }) => {
    // 1. Simple boolean state for a single accordion (default to open)
    const [isExpanded, setIsExpanded] = useState(true);

    if (!product) return null;

    const formatAttributes = () => {
        if (product.attributes && product.attributes.length > 0) {
            return product.attributes.map(attr => ({
                id: attr.id,
                label: attr.key,    
                value: attr.value    
            }));
        }

        return [
            { id: 'cat', label: 'Category', value: product.category },
            { id: 'sku', label: 'SKU Code', value: product.skuCode },
        ].filter(attr => attr.value);
    };

    const attributes = formatAttributes();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                <div style={{
                    backgroundColor: 'var(--color-card)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    {/* --- Clickable Header --- */}
                    <div
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{
                            padding: '1rem 1.5rem',
                            backgroundColor: isExpanded ? 'var(--color-bg)' : 'var(--color-card)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'background-color 0.3s ease',
                            borderBottom: isExpanded ? '1px solid var(--color-border)' : 'none'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ fontSize: '1.5rem' }}>📋</span>
                            <h3 style={{
                                fontSize: '1.1rem',
                                fontWeight: '600',
                                color: 'var(--color-primary)',
                                margin: 0
                            }}>
                                Specifications
                            </h3>
                        </div>
                        <span style={{
                            fontSize: '1.2rem',
                            color: 'var(--color-text-light)',
                            transition: 'transform 0.3s ease',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)'
                        }}>
                            ▼
                        </span>
                    </div>

                    {/* --- Expanded Content Grid --- */}
                    {isExpanded && (
                        <div style={{
                            padding: '1.5rem',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {attributes.map((attr) => (
                                <div key={attr.id}>
                                    <p style={{
                                        color: 'var(--color-text-light)',
                                        fontSize: '0.9rem',
                                        marginBottom: '0.3rem',
                                        fontWeight: '500'
                                    }}>
                                        {attr.label}
                                    </p>
                                    <p style={{
                                        color: 'var(--color-primary)',
                                        fontSize: '1rem',
                                        fontWeight: '600',
                                        margin: 0
                                    }}>
                                        {attr.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductCharacteristics;