import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/card/PageHeader';
import CartList from '../components/cart/CartList';
import CartSummary from '../components/cart/CartSummary';
import { CartContext } from '../context/CartContext';

const Cart = () => {
    const navigate = useNavigate();
    const { cartItems, isLoading, loadCart, updateQuantity, removeFromCart } = useContext(CartContext);

    /**
     * Load cart from backend when component mounts
     */
    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (isLoading) {
        return (
            <>
                <PageHeader 
                    title="Shopping Cart 🛒"
                    subtitle="Review your items before checkout"
                />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-light)' }}>Loading your cart...</p>
                </div>
            </>
        );
    }

    return (
        <>
            <PageHeader 
                title="Shopping Cart 🛒"
                subtitle="Review your items before checkout"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', padding: '2rem' }}>
                <CartList
                    items={cartItems}
                    onQuantityChange={updateQuantity}
                    onRemove={removeFromCart}
                />
                <CartSummary
                    items={cartItems}
                    onCheckout={handleCheckout}
                />
            </div>
        </>
    );
};

export default Cart;
