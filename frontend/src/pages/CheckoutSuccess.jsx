import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import PageHeader from '../components/card/PageHeader';

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatDateTime = (value) => {
    if (!value) {
        return 'Just now';
    }

    return new Date(value).toLocaleString();
};

const primaryLinkStyle = {
    backgroundColor: 'var(--color-action)',
    borderColor: 'var(--color-action)',
    color: 'var(--color-card)',
    fontWeight: 700,
};

const CheckoutSuccess = () => {
    const { state } = useLocation();
    const order = state?.order;
    const fallbackItems = state?.items || [];
    const orderItems = order?.orderLineItems || fallbackItems;
    const subtotal = order?.subtotal ?? state?.totals?.subtotal ?? fallbackItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = order?.total ?? state?.totals?.total ?? subtotal;

    return (
        <>
            <PageHeader
                title="Order Confirmed"
                subtitle="Your order has been placed successfully"
            />

            <div className="container pb-5">
                <div className="card border-0 shadow-sm mx-auto" style={{ maxWidth: '820px' }}>
                    <div className="card-body p-4 p-md-5">
                        <span className="badge rounded-pill text-bg-success mb-3 px-3 py-2">Success</span>

                        <p className="text-uppercase fw-bold small mb-1" style={{ color: 'var(--color-action)' }}>
                            Confirmation
                        </p>
                        <h2 className="h3 fw-bold" style={{ color: 'var(--color-primary)' }}>Thanks for your order</h2>
                        <p className="mb-4" style={{ color: 'var(--color-text-light)' }}>
                            Your order has been saved and sent for processing.
                        </p>

                        <div className="row g-3 mb-4">
                            <div className="col-12 col-md-6">
                                <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--color-bg)' }}>
                                    <span className="small d-block mb-1" style={{ color: 'var(--color-text-light)' }}>Order number</span>
                                    <strong className="d-block text-break" style={{ color: 'var(--color-primary)' }}>
                                        {order?.orderNumber || 'Available in your order history'}
                                    </strong>
                                </div>
                            </div>
                            <div className="col-12 col-md-3">
                                <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--color-bg)' }}>
                                    <span className="small d-block mb-1" style={{ color: 'var(--color-text-light)' }}>Status</span>
                                    <strong style={{ color: 'var(--color-primary)' }}>{order?.status || 'Pending'}</strong>
                                </div>
                            </div>
                            <div className="col-12 col-md-3">
                                <div className="border rounded p-3 h-100" style={{ backgroundColor: 'var(--color-bg)' }}>
                                    <span className="small d-block mb-1" style={{ color: 'var(--color-text-light)' }}>Placed at</span>
                                    <strong style={{ color: 'var(--color-primary)' }}>{formatDateTime(order?.createdAt)}</strong>
                                </div>
                            </div>
                        </div>

                        <div className="row g-3 mb-4">
                            <div className="col-12 col-md-6">
                                <div className="border rounded p-3 h-100">
                                    <span className="small d-block mb-1" style={{ color: 'var(--color-text-light)' }}>Subtotal</span>
                                    <strong>{formatCurrency(subtotal)}</strong>
                                </div>
                            </div>
                            <div className="col-12 col-md-6">
                                <div className="border rounded p-3 h-100">
                                    <span className="small d-block mb-1" style={{ color: 'var(--color-text-light)' }}>Total</span>
                                    <strong style={{ color: 'var(--color-action)' }}>{formatCurrency(total)}</strong>
                                </div>
                            </div>
                        </div>

                        {orderItems.length > 0 && (
                            <div className="border-top pt-4">
                                <h3 className="h5 fw-bold mb-3" style={{ color: 'var(--color-primary)' }}>Items ordered</h3>
                                <div className="list-group list-group-flush">
                                    {orderItems.map((item) => {
                                        const productName = item.productName || item.name || item.skuCode;
                                        const lineTotal = item.lineTotal ?? item.price * item.quantity;

                                        return (
                                            <div className="list-group-item px-0 d-flex justify-content-between gap-3" key={item.id || item.skuCode}>
                                                <span>{item.quantity} x {productName}</span>
                                                <strong>{formatCurrency(lineTotal)}</strong>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <div className="d-grid d-sm-flex gap-2 mt-4">
                            <Link className="btn px-4 py-2" style={primaryLinkStyle} to="/orders">
                                View My Orders
                            </Link>
                            <Link className="btn btn-outline-secondary fw-bold px-4 py-2" to="/">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CheckoutSuccess;
