import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = ({ products, onAddToCart }) => {
    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
            padding: '2rem',
            width: '100%'
        }}>
            {products && products.length > 0 ? (
                products.map((product) => (
                    <ProductCard
                        key={product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                    />
                ))
            ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                    <p style={{ color: 'var(--color-text-light)' }}>No products available</p>
                </div>
            )}
        </div>
    );
};

export default ProductGrid;
