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
        <div>
            {/* Navigation Bar */}
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
                <div className="container">
                    <Link className="navbar-brand" to="/">📦 Order System</Link>
                    <div className="d-flex gap-3">
                        <Link className="btn btn-outline-light" to="/">Home</Link>
                        <Link className="btn btn-outline-light" to="/reservation">Orders</Link>
                        <button onClick={handleLogout} className="btn btn-danger">Logout</button>
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