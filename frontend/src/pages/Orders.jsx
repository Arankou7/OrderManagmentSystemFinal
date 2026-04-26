import React, { useState, useEffect } from 'react';
import { getMyOrders } from '../api/orderApi'; // 👈 Adjust this path to match your folder structure!

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                // Look how clean this is now!
                const data = await getMyOrders();
                setOrders(data);
            } catch (err) {
                setError('Could not load your orders. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Status badges: Pending uses your brand Orange. Completed/Cancelled use standard semantic colors.
    const getStatusStyle = (status) => {
        switch (status?.toUpperCase()) {
            case 'COMPLETED':
                return { bg: '#e6f4ea', text: '#1e8e3e', border: '#1e8e3e' };
            case 'PENDING':
                return { bg: '#fff7ed', text: 'var(--color-action)', border: 'var(--color-action)' }; 
            case 'CANCELLED':
                return { bg: '#fce8e6', text: '#d93025', border: '#d93025' };
            default:
                return { bg: 'var(--color-bg)', text: 'var(--color-text-light)', border: 'var(--color-border)' }; 
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-light)' }}>Loading your orders...</div>;
    }

    if (error) {
        return <div style={{ textAlign: 'center', padding: '4rem', color: '#d93025' }}>{error}</div>;
    }

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1rem' }}>
            <h1 style={{ 
                fontSize: '2.2rem', 
                fontWeight: '800', 
                color: 'var(--color-primary)', 
                marginBottom: '2rem',
                textAlign: 'center' 
            }}>
                Order History 📦
            </h1>

            {orders.length === 0 ? (
                <div style={{ 
                    textAlign: 'center', 
                    padding: '4rem', 
                    backgroundColor: 'var(--color-card)', 
                    borderRadius: '12px',
                    border: `1px solid var(--color-border)`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}>
                    <span style={{ fontSize: '3rem' }}>🛍️</span>
                    <h3 style={{ marginTop: '1rem', color: 'var(--color-text)' }}>You haven't placed any orders yet.</h3>
                    <p style={{ color: 'var(--color-text-light)', marginTop: '0.5rem' }}>When you do, they will appear here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {orders.map((order) => {
                        const statusStyle = getStatusStyle(order.status);
                        
                        return (
                            <div key={order.orderNumber} style={{
                                backgroundColor: 'var(--color-card)',
                                borderRadius: '12px',
                                border: `1px solid var(--color-border)`,
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.03)'
                            }}>
                                {/* Order Header */}
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center',
                                    borderBottom: `1px solid var(--color-border)`,
                                    paddingBottom: '1rem'
                                }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-light)', fontWeight: '500' }}>
                                            Order Placed: {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--color-text)' }}>
                                            Order ID: <span style={{ fontFamily: 'monospace', color: 'var(--color-text-light)' }}>{order.orderNumber}</span>
                                        </p>
                                    </div>
                                    
                                    {/* Status Badge */}
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
                                        {order.status}
                                    </span>
                                </div>

                                {/* Order Items List */}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {order.orderLineItems?.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontWeight: '600', color: 'var(--color-text)' }}>
                                                <span style={{ color: 'var(--color-text-light)', marginRight: '0.5rem' }}>{item.quantity}x</span> 
                                                {item.productName || item.skuCode}
                                            </span>
                                            <span style={{ color: 'var(--color-text-light)', fontWeight: '500' }}>
                                                ${item.price.toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Total Footer */}
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'flex-end',
                                    paddingTop: '1rem',
                                    borderTop: `1px dashed var(--color-border)`
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--color-primary)', fontWeight: '800' }}>
                                        Total: <span style={{ color: 'var(--color-action)' }}>
                                            ${order.orderLineItems?.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2) || "0.00"}
                                        </span>
                                    </h3>
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