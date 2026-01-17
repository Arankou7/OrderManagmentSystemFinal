import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import keycloak from '../Keycloak';

const RootLayout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        keycloak.logout();
        navigate('/signin');
    };

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', minHeight: '100vh' }}>
            {/* Navigation Bar */}
            <nav className="navbar mb-4" style={{ backgroundColor: 'var(--color-primary)' }}>
                <div style={{ display: 'flex', width: '100%', alignItems: 'center', padding: '1rem 2rem', justifyContent: 'space-between' }}>
                    {/* Left: Logo */}
                    <Link className="navbar-brand" to="/" style={{ color: 'var(--color-card)', fontSize: '1.5rem', fontWeight: '700', margin: 0, flex: 1 }}>
                        📦 Order System
                    </Link>

                    {/* Center: Navigation Links */}
                    <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'center' }}>
                        <Link className="btn btn-outline-light" to="/">Home</Link>
                        <Link className="btn btn-outline-light" to="/reservation">Orders</Link>
                    </div>

                    {/* Right: Logout Button */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
                        <button onClick={handleLogout} className="btn" style={{ backgroundColor: 'var(--color-action)', color: 'var(--color-card)', border: 'none', fontWeight: '600' }}>
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            {/* This is where the child pages (Home, Reservation) appear */}
            <div className="container">
                <Outlet />
            </div>
        </div>
    );
};

export default RootLayout;