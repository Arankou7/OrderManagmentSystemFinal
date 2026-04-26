import React, { useState } from 'react';

const CartItem = ({ id, name, price, quantity, image, onQuantityChange, onRemove }) => {
    const [isUpdating, setIsUpdating] = useState(false);

    const handleQuantityChange = async (newQuantity) => {
        setIsUpdating(true);
        try {
            await onQuantityChange(id, newQuantity);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleRemove = async () => {
        setIsUpdating(true);
        try {
            await onRemove(id);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div style={{
            backgroundColor: 'var(--color-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            padding: '1.5rem',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center',
            marginBottom: '1rem',
            transition: 'all 0.3s ease',
            opacity: isUpdating ? 0.6 : 1,
            pointerEvents: isUpdating ? 'none' : 'auto'
        }}>
            {/* Product Image */}
            <div style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: '8px',
                width: '100px',
                height: '100px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
            }}>
                {image ? (
                    <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                    <div style={{ fontSize: '2.5rem', color: 'var(--color-text-light)' }}>📦</div>
                )}
            </div>

            {/* Product Info */}
            <div style={{ flex: 1 }}>
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
                    marginBottom: '0.5rem'
                }}>
                    ${price.toFixed(2)} each
                </p>
            </div>

            {/* Quantity Controls */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '6px',
                padding: '0.25rem'
            }}>
                <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={isUpdating}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: isUpdating ? 'var(--color-text-light)' : 'var(--color-primary)',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        padding: '0.25rem 0.5rem',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        opacity: isUpdating ? 0.5 : 1
                    }}
                >
                    −
                </button>
                <span style={{
                    padding: '0.25rem 0.75rem',
                    fontWeight: '600',
                    color: 'var(--color-primary)',
                    minWidth: '2rem',
                    textAlign: 'center'
                }}>
                    {quantity}
                </span>
                <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={isUpdating}
                    style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: isUpdating ? 'var(--color-text-light)' : 'var(--color-primary)',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        padding: '0.25rem 0.5rem',
                        fontSize: '1.2rem',
                        fontWeight: '700',
                        opacity: isUpdating ? 0.5 : 1
                    }}
                >
                    +
                </button>
            </div>

            {/* Total Price */}
            <div style={{
                textAlign: 'right',
                minWidth: '100px'
            }}>
                <p style={{
                    color: 'var(--color-text-light)',
                    fontSize: '0.9rem',
                    marginBottom: '0.5rem'
                }}>
                    Total
                </p>
                <p style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: 'var(--color-action)',
                    marginBottom: '0.5rem'
                }}>
                    ${(price * quantity).toFixed(2)}
                </p>
            </div>

            {/* Remove Button */}
            <button
                onClick={handleRemove}
                disabled={isUpdating}
                style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border)',
                    color: isUpdating ? 'var(--color-text-light)' : 'var(--color-text-light)',
                    borderRadius: '6px',
                    padding: '0.5rem 1rem',
                    cursor: isUpdating ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    fontWeight: '600',
                    opacity: isUpdating ? 0.5 : 1
                }}
                onMouseEnter={(e) => {
                    if (!isUpdating) {
                        e.currentTarget.style.backgroundColor = '#fee';
                        e.currentTarget.style.color = '#c33';
                        e.currentTarget.style.borderColor = '#fcc';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isUpdating) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--color-text-light)';
                        e.currentTarget.style.borderColor = 'var(--color-border)';
                    }
                }}
            >
                {isUpdating ? '...' : 'Remove'}
            </button>
        </div>
    );
};

export default CartItem;
