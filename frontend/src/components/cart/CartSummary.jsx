import React from 'react';

const CartSummary = ({ items, onCheckout }) => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return (
        <div style={{
            backgroundColor: 'var(--color-card)',
            border: '2px solid var(--color-primary)',
            borderRadius: '8px',
            padding: '2rem',
            position: 'sticky',
            top: '2rem'
        }}>
            <h4 style={{
                color: 'var(--color-primary)',
                fontWeight: '700',
                marginBottom: '1.5rem',
                fontSize: '1.3rem'
            }}>
                Order Summary
            </h4>

            <div style={{ marginBottom: '1rem' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.75rem',
                    borderBottom: '1px solid var(--color-border)'
                }}>
                    <span style={{ color: 'var(--color-text)' }}>Subtotal</span>
                    <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>${subtotal.toFixed(2)}</span>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1rem',
                    paddingBottom: '1rem',
                    borderBottom: '2px solid var(--color-border)'
                }}>
                    <span style={{ color: 'var(--color-text)' }}>Tax (10%)</span>
                    <span style={{ color: 'var(--color-text)', fontWeight: '600' }}>${tax.toFixed(2)}</span>
                </div>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '1.5rem'
                }}>
                    <span style={{ color: 'var(--color-primary)', fontWeight: '700', fontSize: '1.1rem' }}>Total</span>
                    <span style={{ color: 'var(--color-action)', fontWeight: '700', fontSize: '1.3rem' }}>${total.toFixed(2)}</span>
                </div>
            </div>

            <button
                onClick={onCheckout}
                disabled={items.length === 0}
                style={{
                    width: '100%',
                    backgroundColor: items.length === 0 ? 'var(--color-text-light)' : 'var(--color-action)',
                    color: 'var(--color-card)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '1rem',
                    fontWeight: '700',
                    fontSize: '1rem',
                    cursor: items.length === 0 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                    if (items.length > 0) {
                        e.currentTarget.style.backgroundColor = 'var(--color-hover)';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 10px 20px rgba(249, 115, 22, 0.3)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (items.length > 0) {
                        e.currentTarget.style.backgroundColor = 'var(--color-action)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }}
            >
                Proceed to Checkout
            </button>
        </div>
    );
};

export default CartSummary;
