import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requirePin?: boolean;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requirePin = false, 
  requireAuth = false,
  requireAdmin = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const pin = localStorage.getItem('viewPin');
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const userData = user ? JSON.parse(user) : null;
    const isAdmin = userData?.role === 'admin';

    if (requirePin && !pin) {
      navigate('/', { replace: true });
    } else if (requireAuth && !token) {
      navigate('/login', { replace: true });
    } else if (requireAdmin && !isAdmin) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate, requirePin, requireAuth, requireAdmin]);

  return <>{children}</>;
};

export default ProtectedRoute;