import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../../../context/CartContext';
import { fetchInventory } from '../../../api/inventoryApi';

const ProductInfo = ({ product }) => {
    const { addToCart } = useContext(CartContext);
    const [quantity, setQuantity] = useState(1);
    const [addedToCart, setAddedToCart] = useState(false);
    const [inventoryCount, setInventoryCount] = useState(null);
    const [loadingInventory, setLoadingInventory] = useState(false);

    const handleAddToCart = () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleQuantityChange = (value) => {
        const newQty = parseInt(value);
        if (newQty > 0) {
            setQuantity(newQty);
        }
    };

    const handleInventoryLeft = async () => {
        if (product && product.skuCode) {
            setLoadingInventory(true);
            try {
                const data = await fetchInventory.getInventory(product.skuCode);
                setInventoryCount(data.availableQuantity);
            } catch (error) {
                console.error('Error fetching inventory:', error);
                setInventoryCount(0);
            } finally {
                setLoadingInventory(false);
            }
        }
    };

    useEffect(() => {
        handleInventoryLeft();
    }, [product?.skuCode]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
        }}>
            <style>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }
            `}</style>
            {/* Rating and Reviews */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
            }}>
                <div style={{
                    color: 'var(--color-action)',
                    fontSize: '1rem'
                }}>
                    ⭐⭐⭐⭐⭐
                </div>
                <span style={{ color: 'var(--color-text-light)' }}>
                    (245 reviews)
                </span>
            </div>

            {/* Title */}
            <div>
                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: 'var(--color-primary)',
                    marginBottom: '0.5rem'
                }}>
                    {product?.name}
                </h1>
                <p style={{
                    color: 'var(--color-text-light)',
                    fontSize: '1rem'
                }}>
                    SKU: {product?.skuCode}
                </p>
            </div>

            {/* Price Section */}
            <div style={{
                backgroundColor: 'var(--color-bg)',
                padding: '1.5rem',
                borderRadius: '8px',
                border: '1px solid var(--color-border)'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '1rem'
                }}>
                    <span style={{
                        fontSize: '2.5rem',
                        fontWeight: '700',
                        color: 'var(--color-action)'
                    }}>
                        ${product?.price}
                    </span>
                    <span style={{
                        fontSize: '1rem',
                        color: 'var(--color-text-light)',
                        textDecoration: 'line-through'
                    }}>
                        ${(product?.price * 1.2).toFixed(2)}
                    </span>
                    <span style={{
                        backgroundColor: 'var(--color-action)',
                        color: 'white',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                    }}>
                        Save 20%
                    </span>
                </div>

                <div style={{
                    color: inventoryCount < 10 ? 'var(--color-action)' : 'var(--color-success)',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    padding: inventoryCount < 10 ? '0.75rem' : '0',
                    backgroundColor: inventoryCount < 10 ? 'rgba(111, 37, 24, 0.19)' : 'transparent',
                    borderRadius: inventoryCount < 10 ? '6px' : '0',
                    border: inventoryCount < 10 ? '2px solid var(--color-action)' : 'none',
                    animation: inventoryCount < 10 ? 'pulse 1.5s infinite' : 'none'
                }}>
                    {loadingInventory ? (
                        '⏳ Checking stock...'
                    ) : inventoryCount === null ? (
                        '✓ In Stock'
                    ) : inventoryCount > 0 ? (
                        <>
                            {inventoryCount < 10 ? (
                                <>
                                    ⚠️ HURRY! Only <strong>{inventoryCount} left</strong> in stock - Get yours before it's gone!
                                </>
                            ) : (
                                <>
                                    ✓ {inventoryCount} in stock
                                </>
                            )}
                        </>
                    ) : (
                        '❌ Out of Stock'
                    )}
                </div>

                {/* Quantity Selector */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <label style={{ color: 'var(--color-text-light)' }}>
                        Quantity:
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="100"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--color-border)',
                            width: '60px',
                            textAlign: 'center',
                            backgroundColor: 'var(--color-card)',
                            color: 'var(--color-primary)',
                            fontSize: '1rem'
                        }}
                    />
                </div>
            </div>

            {/* Add to Cart Button */}
            <button
                onClick={handleAddToCart}
                style={{
                    backgroundColor: addedToCart ? 'var(--color-success)' : 'var(--color-action)',
                    color: 'white',
                    padding: '1rem 2rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                    if (!addedToCart) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.2)';
                    }
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                }}
            >
                {addedToCart ? '✓ Added to Cart' : '🛒 Add to Cart'}
            </button>

            {/* Product Description */}
            <div>
                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: 'var(--color-primary)',
                    marginBottom: '0.5rem'
                }}>
                    Description
                </h3>
                <p style={{
                    color: 'var(--color-text-light)',
                    lineHeight: '1.6'
                }}>
                    {product?.description}
                </p>
            </div>
        </div>
    );
};

export default ProductInfo;
