import React, { useContext } from 'react';
import PageHeader from '../components/card/PageHeader';
import CartList from '../components/cart/CartList';
import CartSummary from '../components/cart/CartSummary';
import { CartContext } from '../context/CartContext';

const Cart = () => {
    const { cartItems, updateQuantity, removeFromCart } = useContext(CartContext);

    const handleCheckout = () => {
        console.log('Proceeding to checkout with items:', cartItems);
        // TODO: Implement checkout logic
    };

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
