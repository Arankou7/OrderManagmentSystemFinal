import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');

    // If no token exists, force redirect to Login page
    if (!token) {
        return <Navigate to="/signin" replace />;
    }

    // If token exists, show the protected page
    return children;
};

export default ProtectedRoute;