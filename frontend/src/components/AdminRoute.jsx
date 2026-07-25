import React from 'react';
import { Navigate } from 'react-router-dom';
import keycloak from '../Keycloak';

/**
 * This improves navigation UX only. The Spring services remain the source of
 * truth and reject non-ADMIN API calls even if this route is bypassed.
 */
const AdminRoute = ({ children }) => {
    const hasAdminRole = keycloak.hasRealmRole('ADMIN') || keycloak.hasResourceRole('ADMIN');

    return hasAdminRole ? children : <Navigate to="/" replace />;
};

export default AdminRoute;
