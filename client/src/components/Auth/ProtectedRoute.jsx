import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';

const SESSION_DURATION = 5 * 60 * 60 * 1000; // 5 hours in ms

const isSessionExpired = () => {
  const loginTime = localStorage.getItem('adminLoginTime');
  if (!loginTime) return true;
  return Date.now() - parseInt(loginTime, 10) > SESSION_DURATION;
};

const clearSession = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminLoginTime');
};

const ProtectedRoute = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!token) return;

    // Check immediately on mount
    if (isSessionExpired()) {
      clearSession();
      navigate('/login', { replace: true });
      return;
    }

    // Set a timer to auto-logout when session expires
    const loginTime = parseInt(localStorage.getItem('adminLoginTime'), 10);
    const remaining = SESSION_DURATION - (Date.now() - loginTime);

    const timer = setTimeout(() => {
      clearSession();
      window.location.replace('/login'); // hard reload to clear any state
    }, remaining);

    return () => clearTimeout(timer);
  }, [token, navigate]);

  if (!token || isSessionExpired()) {
    clearSession();
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;