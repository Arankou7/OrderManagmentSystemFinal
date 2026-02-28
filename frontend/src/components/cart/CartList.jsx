import React from 'react';
import CartItem from './CartItem';

const CartList = ({ items, onQuantityChange, onRemove }) => {
    if (items.length === 0) {
        return (
            <div style={{
                backgroundColor: 'var(--color-card)',
                borderRadius: '8px',
                padding: '3rem',
                textAlign: 'center',
                border: '2px dashed var(--color-border)'
            }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                <h3 style={{ color: 'var(--color-text-light)', marginBottom: '0.5rem' }}>Your cart is empty</h3>
                <p style={{ color: 'var(--color-text-light)' }}>Add items to your cart to get started!</p>
            </div>
        );
    }

    return (
        <div>
            {items.map((item) => (
                <CartItem
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    price={item.price}
                    quantity={item.quantity}
                    image={item.image}
                    onQuantityChange={onQuantityChange}
                    onRemove={onRemove}
                />
            ))}
        </div>
    );
};

export default CartList;
