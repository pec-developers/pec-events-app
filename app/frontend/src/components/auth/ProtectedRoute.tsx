import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const role = user.role.toUpperCase();

  if (allowedRoles && !allowedRoles.map(r => r.toUpperCase()).includes(role)) {
    // Authenticated but wrong role -> Redirect to correct role landing page
    if (role === 'ADMIN') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'SPOC') {
      return <Navigate to="/spoc" replace />;
    } else if (role === 'STUDENT_COORDINATOR' || role === 'FACULTY_COORDINATOR') {
      return <Navigate to="/coordinator" replace />;
    } else {
      return <Navigate to="/student" replace />;
    }
  }

  return <>{children}</>;
}

export default ProtectedRoute;
