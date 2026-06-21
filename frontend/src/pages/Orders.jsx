import React, { useState, useEffect } from 'react';
import { getMyOrders } from '../api/orderApi';

const formatCurrency = (value) => `$${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
    if (!value) {
        return 'Unknown date';
    }

    return new Date(value).toLocaleString();
};

const calculateFallbackTotal = (order) => {
    return order.orderLineItems?.reduce((total, item) => total + (item.price * item.quantity), 0) || 0;
};

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const fetchOrders = async (showLoading = false) => {
            try {
                if (showLoading) {
                    setLoading(true);
                }

                const data = await getMyOrders();
                if (isMounted) {
                    setOrders(data);
                    setError(null);
                }
            } catch {
                if (isMounted) {
                    setError('Could not load your orders. Please try again later.');
                }
            } finally {
                if (isMounted && showLoading) {
                    setLoading(false);
                }
            }
        };

        fetchOrders(true);
        const intervalId = window.setInterval(() => fetchOrders(false), 10000);

        return () => {
            isMounted = false;
            window.clearInterval(intervalId);
        };
    }, []);

    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED':
            case 'DELIVERED':
            case 'CONFIRMED':
                return { bg: '#e6f4ea', text: '#1e8e3e', border: '#1e8e3e' };
            case 'SHIPPED':
                return { bg: '#e8f0fe', text: '#1967d2', border: '#1967d2' };
            case 'PENDING':
                return { bg: '#fff7ed', text: 'var(--color-action)', border: 'var(--color-action)' };
            case 'CANCELLED':
            case 'FAILED':
                return { bg: '#fce8e6', text: '#d93025', border: '#d93025' };
            default:
                return { bg: 'var(--color-bg)', text: 'var(--color-text-light)', border: 'var(--color-border)' };
        }
    };

    const getStatusLabel = (status) => {
        if (status?.toUpperCase() === 'DELIVERED') {
            return 'FINISHED';
        }

        return status;
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>Loading your orders...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: '4rem', color: '#d93025' }}>{error}</div>;
    }

    return (
        <div className="container" style={{ maxWidth: '940px', padding: '2rem 1rem' }}>
            <h1 style={{
                fontSize: '2.2rem',
                fontWeight: '800',
                color: 'var(--color-primary)',
                marginBottom: '2rem',
                textAlign: 'center'
            }}>
                Order History
            </h1>

            {orders.length === 0 ? (
                <div className="card border-0 shadow-sm text-center">
                    <div className="card-body p-5">
                        <h3 style={{ color: 'var(--color-text)' }}>You haven't placed any orders yet.</h3>
                        <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem' }}>When you do, they will appear here.</p>
                    </div>
                </div>
            ) : (
                <div className="d-flex flex-column gap-4">
                    {orders.map((order) => {
                        const statusStyle = getStatusStyle(order.status);
                        const total = order.total ?? calculateFallbackTotal(order);
                        const subtotal = order.subtotal ?? calculateFallbackTotal(order);

                        return (
                            <div key={order.orderNumber} className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 border-bottom pb-3 mb-3">
                                        <div>
                                            <p className="mb-1 fw-semibold" style={{ color: 'var(--color-text-light)' }}>
                                                Order Placed: {formatDate(order.createdAt)}
                                            </p>
                                            <p className="mb-0 small" style={{ color: 'var(--color-text)' }}>
                                                Order ID: <span style={{ fontFamily: 'monospace', color: 'var(--color-text-light)' }}>{order.orderNumber}</span>
                                            </p>
                                        </div>

                                        <div className="d-flex flex-wrap gap-2">
                                            <span style={{
                                                backgroundColor: statusStyle.bg,
                                                color: statusStyle.text,
                                                border: `1px solid ${statusStyle.border}`,
                                                padding: '0.35rem 0.85rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.85rem',
                                                fontWeight: '700',
                                                letterSpacing: '0.5px'
                                            }}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="list-group list-group-flush">
                                        {order.orderLineItems?.map((item) => {
                                            const lineTotal = item.lineTotal ?? item.price * item.quantity;

                                            return (
                                                <div key={item.id || item.skuCode} className="list-group-item px-0 d-flex justify-content-between align-items-center gap-3">
                                                    <span className="fw-semibold" style={{ color: 'var(--color-text)' }}>
                                                        <span style={{ color: 'var(--color-text-light)', marginRight: '0.5rem' }}>{item.quantity}x</span>
                                                        {item.productName || item.skuCode}
                                                    </span>
                                                    <span style={{ color: 'var(--color-text-light)', fontWeight: '500' }}>
                                                        {formatCurrency(lineTotal)}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="border-top pt-3 mt-3">
                                        <div className="d-flex justify-content-end gap-4 flex-wrap">
                                            <span style={{ color: 'var(--color-text-light)' }}>
                                                Subtotal: <strong>{formatCurrency(subtotal)}</strong>
                                            </span>
                                            <h3 className="h5 m-0" style={{ color: 'var(--color-primary)', fontWeight: '800' }}>
                                                Total: <span style={{ color: 'var(--color-action)' }}>{formatCurrency(total)}</span>
                                            </h3>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Orders;
