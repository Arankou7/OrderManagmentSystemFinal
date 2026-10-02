import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import CartList from '../../components/cart/CartList';
import CartSummary from '../../components/cart/CartSummary';
import { CartContext } from '../../context/cartContextValue';

const Cart = () => {
  const navigate = useNavigate();
  const { cartItems, isLoading, isMutating, error, loadCart, updateQuantity, removeFromCart } =
    useContext(CartContext);

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
          title="Shopping Cart"
          subtitle="Review your items before checkout"
        />
        <div className="container pb-5 text-center">
          <div
            className="card border-0 shadow-sm mx-auto p-5"
            style={{ maxWidth: '560px' }}
          >
            <div
              className="spinner-border mx-auto mb-3"
              style={{ color: 'var(--color-action)' }}
              role="status"
            />
            <p
              className="mb-0"
              style={{ color: 'var(--color-text-light)' }}
            >
              Loading your cart...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Shopping Cart"
        subtitle="Review your items before checkout"
      />
      <div className="container pb-5">
        {error && (
          <div
            className="alert alert-danger"
            role="alert"
          >
            Your cart could not be updated.{' '}
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={loadCart}
            >
              Reload cart
            </button>
          </div>
        )}
        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-8">
            <CartList
              items={cartItems}
              onQuantityChange={updateQuantity}
              onRemove={removeFromCart}
            />
          </div>
          <div className="col-12 col-lg-4">
            <CartSummary
              items={cartItems}
              onCheckout={handleCheckout}
              disabled={isMutating || Boolean(error)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
