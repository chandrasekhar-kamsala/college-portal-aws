import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/** Redirects unauthenticated users to the landing page. */
export function RequireAuth({ children, role }) {
  const { isAuthenticated, role: userRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  if (role && userRole !== role) {
    // Wrong role — kick them to their own area
    return <Navigate to={userRole === 'ADMIN' ? '/admin' : '/student'} replace />;
  }
  return children;
}

/** Redirects already-logged-in users away from login pages. */
export function RedirectIfAuth({ children }) {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={role === 'ADMIN' ? '/admin' : '/student'} replace />;
  }
  return children;
}
