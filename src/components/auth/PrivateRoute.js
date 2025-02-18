import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ element: Component, requiredRole, layout: Layout }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Cargando...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && user.rol !== requiredRole) {
        return <Navigate to="/" replace />;
    }

    return Layout ? (
        <Layout>
            <Component />
        </Layout>
    ) : (
        <Component />
    );
};

export default PrivateRoute;