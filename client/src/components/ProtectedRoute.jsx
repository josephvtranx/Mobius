import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const location = useLocation();
    const [isVerifying, setIsVerifying] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const token = localStorage.getItem('token');
                const user = JSON.parse(localStorage.getItem('user'));
                
                if (!token || !user) {
                    throw new Error('No token or user found');
                }

                // Verify token with backend using our api instance
                const response = await api.get('/auth/verify');

                if (response.data.valid) {
                    setIsAuthenticated(true);
                } else {
                    throw new Error('Invalid token');
                }
            } catch (error) {
                console.error('Authentication error:', error);
                // Clear invalid credentials
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [location.pathname]);

    // Show loading state while verifying
    if (isVerifying) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    // Check if user is authenticated
    if (!isAuthenticated || !user || !token) {
        // Redirect to login page but save the location they were trying to access
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access if roles are specified
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
        // Redirect to unauthorized page
        return <Navigate to="/unauthorized" replace />;
    }

    // If everything is ok, render the protected component
    return children;
};

export default ProtectedRoute; 