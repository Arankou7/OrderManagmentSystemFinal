import React from 'react';
import { useNavigate } from 'react-router-dom';

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
        <div 
            onClick={handleCardClick}
            style={{
                backgroundColor: 'var(--color-card)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(15, 23, 42, 0.1)';
                e.currentTarget.style.transform = 'translateY(-4px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
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
                    <button 
                        onClick={handleAddToCartClick}
                        style={{
                            backgroundColor: 'var(--color-action)',
                            color: 'var(--color-card)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.5rem 1rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--color-action)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
