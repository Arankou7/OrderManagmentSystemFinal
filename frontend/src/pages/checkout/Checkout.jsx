import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { CartContext } from '../../context/cartContextValue';
import { createOrder } from '../../api/orderApi';
import { toast } from '../../utils/toast';

import { formatCurrency } from '../../utils/format';

const getCheckoutErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (typeof error.response?.data === 'string') {
    return error.response.data;
  }

  if (error.response?.data?.error) {
    return error.response.data.error;
  }

  if (error.response?.status === 400) {
    return 'Some items in your cart need attention before you can place the order.';
  }

  if (error.response?.status === 500) {
    return 'The order service could not complete the request. Please review your cart and try again.';
  }

  return 'Failed to place order. Please try again.';
};

const primaryButtonStyle = {
  backgroundColor: 'var(--color-action)',
  borderColor: 'var(--color-action)',
  color: 'var(--color-card)',
  fontWeight: 700,
};

const createIdempotencyKey = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const Checkout = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    clearCart,
    isLoading,
    isMutating,
    loadCart,
    error: cartError,
  } = useContext(CartContext);
  const submittingRef = useRef(false);
  const attemptRef = useRef(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
      subtotal,
      total: subtotal,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cartItems]);

  const handlePlaceOrder = async () => {
    if (submittingRef.current || isLoading || isMutating || cartError) return;
    if (cartItems.length === 0) {
      toast.error('Your cart is empty. Please add items before checkout.');
      return;
    }

    try {
      submittingRef.current = true;
      setIsSubmitting(true);
      setCheckoutError('');

      const fingerprint = JSON.stringify(
        cartItems.map(({ skuCode, quantity, price }) => ({ skuCode, quantity, price })),
      );
      if (attemptRef.current?.fingerprint !== fingerprint) {
        attemptRef.current = { fingerprint, key: createIdempotencyKey() };
      }
      const idempotencyKey = attemptRef.current.key;
      const orderResponse = await createOrder(idempotencyKey);
      const orderedItems = cartItems.map((item) => ({ ...item }));

      clearCart();
      toast.success(`Order ${orderResponse.orderNumber} placed successfully.`);

      navigate('/checkout/success', {
        replace: true,
        state: {
          order: orderResponse,
          items: orderedItems,
          totals,
          idempotencyKey,
        },
      });
    } catch (error) {
      console.error('Checkout error:', error);
      const errorMessage = getCheckoutErrorMessage(error);
      setCheckoutError(errorMessage);
      toast.error(errorMessage);
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="Checkout"
          subtitle="Loading your latest cart details"
        />
        <div className="container pb-5">
          <div
            className="card border-0 shadow-sm mx-auto text-center p-5"
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

  if (cartError)
    return (
      <div
        className="state-panel"
        role="alert"
      >
        <h1 className="h4">Your cart could not be verified</h1>
        <p>Please reload your cart before placing an order.</p>
        <button
          className="btn btn-dark"
          onClick={loadCart}
        >
          Reload cart
        </button>
      </div>
    );

  if (cartItems.length === 0 && !isSubmitting) {
    return (
      <>
        <PageHeader
          title="Checkout"
          subtitle="Your cart is ready when you are"
        />
        <div className="container pb-5">
          <div
            className="card border-0 shadow-sm mx-auto text-center p-5"
            style={{ maxWidth: '560px' }}
          >
            <h2
              className="h4 fw-bold"
              style={{ color: 'var(--color-primary)' }}
            >
              Your cart is empty
            </h2>
            <p style={{ color: 'var(--color-text-light)' }}>
              Add a few products first, then come back here to place your order.
            </p>
            <button
              className="btn px-4 py-2 align-self-center"
              style={primaryButtonStyle}
              onClick={() => navigate('/cart')}
            >
              Back to Cart
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Order Review"
        subtitle="Check your items and totals before placing the order"
      />

      <div className="container pb-5">
        <div
          className="row g-3 mb-4"
          aria-label="Checkout progress"
        >
          {['Cart', 'Review', 'Confirmation'].map((step) => {
            const isActive = step === 'Review';
            const isComplete = step === 'Cart';

            return (
              <div
                className="col-12 col-md-4"
                key={step}
              >
                <div
                  className={`card text-center h-100 ${isActive ? 'text-white' : ''}`}
                  style={{
                    backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-card)',
                    borderColor:
                      isActive || isComplete ? 'var(--color-primary)' : 'var(--color-border)',
                    color: isActive ? 'var(--color-card)' : 'var(--color-text-light)',
                  }}
                >
                  <div className="card-body py-3 fw-bold">{step}</div>
                </div>
              </div>
            );
          })}
        </div>

        {checkoutError && (
          <div
            className="alert alert-danger d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3"
            role="alert"
          >
            <div>
              <strong className="d-block">Order could not be placed.</strong>
              <span>{checkoutError}</span>
            </div>
            <button
              type="button"
              className="btn btn-danger fw-bold"
              onClick={() => navigate('/cart')}
            >
              Review cart
            </button>
          </div>
        )}

        <div className="row g-4 align-items-start">
          <div className="col-12 col-lg-8">
            <section
              className="card border-0 shadow-sm"
              aria-labelledby="checkout-items-title"
            >
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-start gap-3 mb-4">
                  <div>
                    <p
                      className="text-uppercase fw-bold small mb-1"
                      style={{ color: 'var(--color-action)' }}
                    >
                      Final review
                    </p>
                    <h2
                      id="checkout-items-title"
                      className="h4 fw-bold mb-0"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Items in your order
                    </h2>
                  </div>
                  <span className="badge rounded-pill text-bg-light border px-3 py-2">
                    {totals.itemCount} item{totals.itemCount === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="list-group list-group-flush">
                  {cartItems.map((item) => (
                    <article
                      className="list-group-item px-0 py-3"
                      key={item.id}
                    >
                      <div className="row g-3 align-items-center">
                        <div className="col-auto">
                          <div
                            className="rounded d-flex align-items-center justify-content-center overflow-hidden fw-bold"
                            style={{
                              width: '74px',
                              height: '74px',
                              backgroundColor: 'var(--color-bg)',
                              color: 'var(--color-primary)',
                            }}
                          >
                            {item.image ? (
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-100 h-100 object-fit-cover"
                              />
                            ) : (
                              <span>{item.name?.charAt(0)?.toUpperCase() || 'P'}</span>
                            )}
                          </div>
                        </div>

                        <div className="col">
                          <h3
                            className="h6 fw-bold mb-1"
                            style={{ color: 'var(--color-primary)' }}
                          >
                            {item.name}
                          </h3>
                          <p
                            className="small mb-0"
                            style={{ color: 'var(--color-text-light)' }}
                          >
                            SKU: {item.skuCode || item.id}
                          </p>
                          <p
                            className="small mb-0"
                            style={{ color: 'var(--color-text-light)' }}
                          >
                            Qty {item.quantity} x {formatCurrency(item.price)}
                          </p>
                        </div>

                        <div
                          className="col-12 col-sm-auto text-sm-end fw-bold"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {formatCurrency(item.price * item.quantity)}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          </div>

          <div className="col-12 col-lg-4">
            <aside
              className="card border-0 shadow-sm sticky-lg-top"
              style={{ top: '2rem' }}
              aria-label="Order summary"
            >
              <div className="card-body p-4">
                <p
                  className="text-uppercase fw-bold small mb-1"
                  style={{ color: 'var(--color-action)' }}
                >
                  Summary
                </p>
                <h2
                  className="h4 fw-bold mb-4"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Order total
                </h2>

                <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                  <span style={{ color: 'var(--color-text-light)' }}>Subtotal</span>
                  <strong style={{ color: 'var(--color-primary)' }}>
                    {formatCurrency(totals.subtotal)}
                  </strong>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span
                    className="h5 fw-bold mb-0"
                    style={{ color: 'var(--color-action)' }}
                  >
                    Total
                  </span>
                  <strong
                    className="h4 mb-0"
                    style={{ color: 'var(--color-action)' }}
                  >
                    {formatCurrency(totals.total)}
                  </strong>
                </div>

                <div className="alert alert-warning small mb-4">
                  Stock is confirmed when you place the order. If something changed, we will ask you
                  to review the cart.
                </div>

                <div className="d-grid gap-2">
                  <button
                    className="btn btn-lg"
                    style={primaryButtonStyle}
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting || isMutating}
                  >
                    {isSubmitting ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          aria-hidden="true"
                        />
                        Placing order...
                      </>
                    ) : (
                      'Place Order'
                    )}
                  </button>

                  <button
                    className="btn btn-outline-secondary btn-lg fw-bold"
                    onClick={() => navigate('/cart')}
                    disabled={isSubmitting || isMutating}
                  >
                    Edit Cart
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
