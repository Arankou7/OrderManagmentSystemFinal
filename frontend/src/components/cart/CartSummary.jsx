import React from 'react';

const CartSummary = ({ items, onCheckout, disabled = false }) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div
      className="card border-0 shadow-sm sticky-lg-top"
      style={{ top: '2rem' }}
    >
      <div className="card-body p-4">
        <h4
          className="fw-bold mb-4"
          style={{ color: 'var(--color-primary)' }}
        >
          Order Summary
        </h4>

        <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
          <span style={{ color: 'var(--color-text)' }}>Subtotal</span>
          <strong style={{ color: 'var(--color-text)' }}>${subtotal.toFixed(2)}</strong>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-4">
          <span
            className="h5 fw-bold mb-0"
            style={{ color: 'var(--color-primary)' }}
          >
            Total
          </span>
          <strong
            className="h4 mb-0"
            style={{ color: 'var(--color-action)' }}
          >
            ${subtotal.toFixed(2)}
          </strong>
        </div>

        <button
          onClick={onCheckout}
          disabled={disabled || items.length === 0}
          className="btn btn-lg w-100 fw-bold"
          style={{
            backgroundColor: items.length === 0 ? 'var(--color-text-light)' : 'var(--color-action)',
            borderColor: items.length === 0 ? 'var(--color-text-light)' : 'var(--color-action)',
            color: 'var(--color-card)',
          }}
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartSummary;
