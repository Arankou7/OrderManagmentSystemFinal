import React from 'react';
import { Link } from 'react-router-dom';
import CartItem from './CartItem';

const CartList = ({ items, onQuantityChange, onRemove }) => {
  if (items.length === 0) {
    return (
      <div className="card border-0 shadow-sm text-center">
        <div className="card-body p-5">
          <div
            className="rounded-circle d-inline-flex align-items-center justify-content-center fw-bold mb-3"
            style={{
              width: '64px',
              height: '64px',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-primary)',
              fontSize: '1.5rem',
            }}
          >
            0
          </div>
          <h3
            className="h4 fw-bold"
            style={{ color: 'var(--color-primary)' }}
          >
            Your cart is empty
          </h3>
          <p
            className="mb-0"
            style={{ color: 'var(--color-text-light)' }}
          >
            Add items to your cart to get started.
          </p>
          <Link
            to="/"
            className="btn btn-primary mt-3"
          >
            Browse catalogue
          </Link>
        </div>
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
