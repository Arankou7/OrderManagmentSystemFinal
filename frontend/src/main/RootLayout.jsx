import React, { useContext, useEffect } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import keycloak from '../Keycloak';
import { CartContext } from '../context/cartContextValue';

const RootLayout = () => {
    const navigate = useNavigate();
    const { getTotalItems, loadCart } = useContext(CartContext);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const handleLogout = () => {
        keycloak.logout();
        navigate('/signin');
    };

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            <nav className="navbar mb-4" style={{ backgroundColor: 'var(--color-primary)' }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '1rem 2rem', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                    <Link className="navbar-brand" to="/" style={{ color: 'var(--color-card)', fontSize: '1.5rem', fontWeight: '700', margin: 0, flex: '1 1 180px' }}>
                        Order System
                    </Link>

                    <div style={{ display: 'flex', gap: '1rem', flex: '1 1 260px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Link className="btn btn-outline-light" to="/">Home</Link>
                        <Link className="btn btn-outline-light" to="/orders">Orders</Link>
                        <Link className="btn btn-outline-light" to="/cart" style={{ position: 'relative' }}>
                            Cart
                            <span style={{
                                position: 'absolute',
                                top: '-8px',
                                right: '-8px',
                                backgroundColor: 'var(--color-action)',
                                color: 'white',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.75rem',
                                fontWeight: 'bold'
                            }}>{getTotalItems()}</span>
                        </Link>
                    </div>

                    <div style={{ flex: '1 1 180px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={handleLogout} className="btn" style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-card)', border: 'none', fontWeight: '600' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container">
                <Outlet />
            </div>
        </div>
    );
};

export default RootLayout;
