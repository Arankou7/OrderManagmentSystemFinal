import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion'; // 👈 Import added

const ProductCard = ({ product, onAddToCart }) => {
    const { id, name, price, description, category, skuCode } = product || {};
    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/product/${id}`);
    };

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        onAddToCart && onAddToCart(id);
    };

    return (
        <motion.div 
            layout // 👈 Makes the card smoothly slide to its new spot when filtering
            initial={{ opacity: 0, scale: 0.9 }} // 👈 Starting state (invisible & slightly small)
            animate={{ opacity: 1, scale: 1 }}   // 👈 End state (fully visible)
            exit={{ opacity: 0, scale: 0.9 }}    // 👈 Exit state when filtered out
            transition={{ duration: 0.3 }}
            whileHover={{ 
                y: -4, 
                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.1)' 
            }} // 👈 Replaces your onMouseEnter/Leave!
            onClick={handleCardClick}
            style={{
                backgroundColor: 'var(--color-card)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                cursor: 'pointer'
            }}
        >
            {/* Product Image */}
            <div style={{
                backgroundColor: 'var(--color-bg)',
                height: '200px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <div style={{
                    fontSize: '3rem',
                    color: 'var(--color-text-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    📦
                </div>
            </div>

            {/* Product Info */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h5 style={{ 
                    color: 'var(--color-primary)', 
                    fontWeight: '700', 
                    marginBottom: '0.5rem',
                    fontSize: '1.1rem'
                }}>
                    {name}
                </h5>
                
                <p style={{
                    color: 'var(--color-text-light)',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    flex: 1
                }}>
                    {description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: 'var(--color-action)'
                    }}>
                        ${price}
                    </span>
                    <motion.button 
                        whileHover={{ 
                            backgroundColor: 'var(--color-hover)',
                            y: -2 
                        }} // 👈 Upgraded button hover
                        whileTap={{ scale: 0.95 }} // Adds a click "press" effect!
                        onClick={handleAddToCartClick}
                        style={{
                            backgroundColor: 'var(--color-action)',
                            color: 'var(--color-card)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            fontWeight: '600',
                            cursor: 'pointer'
                        }}
                    >
                        Add to Cart
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;