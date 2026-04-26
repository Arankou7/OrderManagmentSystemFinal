import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/card/PageHeader';
import { CartContext } from '../context/CartContext';
import { createOrder } from '../api/orderApi';
import { toast } from '../utils/toast';

const Checkout = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useContext(CartContext);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handlePlaceOrder = async () => {
        // Validate cart not empty BEFORE sending request
        if (cartItems.length === 0) {
            toast.error('Your cart is empty. Please add items before checkout.');
            return;
        }

        try {
            setIsSubmitting(true);
            
            console.log('Placing order with cart items:', cartItems);
            
            // Create order - backend handles everything:
            // - Fetches cart from auth token
            // - Confirms stock reservation
            // - Creates order with line items
            // - Clears the cart
            const orderResponse = await createOrder();
            
            // Order created successfully
            toast.success(`Order ${orderResponse.orderNumber} placed successfully! 🎉`);
            
            // Clear local cart state
            clearCart();
            
            // Redirect to home after 2 seconds
            setTimeout(() => {
                navigate('/');
            }, 2000);
            
        } catch (error) {
            console.error('Checkout error:', error);
            console.error('Error response:', error.response);
            console.error('Error data:', error.response?.data);
            console.error('Error status:', error.response?.status);
            
            // Extract error message from backend response
            let errorMessage = 'Failed to place order. Please try again.';
            
            // Try multiple ways to extract error message from backend
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (typeof error.response?.data === 'string') {
                errorMessage = error.response.data;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.response?.status === 400) {
                errorMessage = 'Invalid order request. Please check your cart.';
            } else if (error.response?.status === 500) {
                errorMessage = 'Server error. Your cart may be empty or invalid. Please try again.';
            }
            
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    // If cart is empty, redirect to cart
    if (cartItems.length === 0 && !isSubmitting) {
        return (
            <>
                <PageHeader 
                    title="Checkout"
                    subtitle="Review your order"
                />
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <p style={{ color: 'var(--color-text-light)', marginBottom: '1rem' }}>Your cart is empty</p>
                    <button
                        onClick={() => navigate('/cart')}
                        style={{
                            backgroundColor: 'var(--color-action)',
                            color: 'var(--color-card)',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '0.75rem 2rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Back to Cart
                    </button>
                </div>
            </>
        );
    }

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    return (
        <>
            <PageHeader 
                title="Order Review"
                subtitle="Ready to complete your purchase?"
            />
            <div style={{ 
                display: 'flex',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                {/* Order Summary Card */}
                <div style={{
                    backgroundColor: 'var(--color-card)',
                    border: '2px solid var(--color-primary)',
                    borderRadius: '8px',
                    padding: '2rem',
                    maxWidth: '600px',
                    width: '100%'
                }}>
                    <h3 style={{
                        color: 'var(--color-primary)',
                        fontWeight: '700',
                        marginBottom: '2rem',
                        fontSize: '1.5rem'
                    }}>
                        Order Summary
                    </h3>

                    {/* Items List */}
                    <div style={{ 
                        marginBottom: '2rem', 
                        maxHeight: '400px', 
                        overflowY: 'auto',
                        paddingBottom: '1rem',
                        borderBottom: '2px solid var(--color-border)'
                    }}>
                        {cartItems.map(item => (
                            <div key={item.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '1.5rem',
                                paddingBottom: '1rem',
                                borderBottom: '1px solid var(--color-border)'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <p style={{
                                        color: 'var(--color-text)',
                                        fontWeight: '600',
                                        marginBottom: '0.25rem',
                                        fontSize: '1rem'
                                    }}>
                                        {item.name}
                                    </p>
                                    <p style={{
                                        color: 'var(--color-text-light)',
                                        fontSize: '0.9rem'
                                    }}>
                                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                                    </p>
                                </div>
                                <p style={{
                                    color: 'var(--color-action)',
                                    fontWeight: '700',
                                    fontSize: '1.1rem',
                                    minWidth: '100px',
                                    textAlign: 'right'
                                }}>
                                    ${(item.price * item.quantity).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Pricing Summary */}
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '1rem'
                        }}>
                            <span style={{ color: 'var(--color-text)' }}>Subtotal</span>
                            <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>
                                ${subtotal.toFixed(2)}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '1rem',
                            paddingBottom: '1rem',
                            borderBottom: '2px solid var(--color-border)'
                        }}>
                            <span style={{ color: 'var(--color-text)' }}>Tax (10%)</span>
                            <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>
                                ${tax.toFixed(2)}
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                            <span style={{ 
                                color: 'var(--color-primary)', 
                                fontWeight: '700', 
                                fontSize: '1.2rem' 
                            }}>
                                Total
                            </span>
                            <span style={{
                                color: 'var(--color-action)',
                                fontWeight: '700',
                                fontSize: '1.3rem'
                            }}>
                                ${total.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {/* Place Order Button */}
                        <button
                            onClick={handlePlaceOrder}
                            disabled={isSubmitting}
                            style={{
                                flex: 1,
                                backgroundColor: isSubmitting ? 'var(--color-text-light)' : 'var(--color-action)',
                                color: 'var(--color-card)',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '1rem',
                                fontWeight: '700',
                                fontSize: '1.1rem',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                opacity: isSubmitting ? 0.7 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(249, 115, 22, 0.3)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.backgroundColor = 'var(--color-action)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }
                            }}
                        >
                            {isSubmitting ? 'Processing...' : 'Place Order'}
                        </button>

                        {/* Back to Cart Button */}
                        <button
                            onClick={() => navigate('/cart')}
                            disabled={isSubmitting}
                            style={{
                                flex: 1,
                                backgroundColor: 'transparent',
                                color: 'var(--color-primary)',
                                border: '2px solid var(--color-border)',
                                borderRadius: '6px',
                                padding: '1rem',
                                fontWeight: '600',
                                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                transition: 'all 0.3s ease',
                                opacity: isSubmitting ? 0.5 : 1
                            }}
                            onMouseEnter={(e) => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.backgroundColor = 'var(--color-bg)';
                                    e.currentTarget.style.borderColor = 'var(--color-primary)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isSubmitting) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = 'var(--color-border)';
                                }
                            }}
                        >
                            Back to Cart
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Checkout;
