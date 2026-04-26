import React from 'react';
import ProductCard from './ProductCard';
import { motion, AnimatePresence } from 'framer-motion'; // 👈 Import added

const ProductGrid = ({ products, onAddToCart }) => {
    return (
        <motion.div 
            layout // 👈 Smooth grid resizing
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '2rem',
                padding: '2rem',
                width: '100%'
            }}
        >
            <AnimatePresence>
                {products && products.length > 0 ? (
                    products.map((product) => (
                        <ProductCard
                            key={product.id} // MUST have a key for AnimatePresence to work!
                            product={product}
                            onAddToCart={onAddToCart}
                        />
                    ))
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}
                    >
                        <p style={{ color: 'var(--color-text-light)' }}>No products available</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProductGrid;